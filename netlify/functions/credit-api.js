const fetch = require("node-fetch");

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
  try {
    const response = await fetch(url, options);

    if (response.status === 429 && retries > 0) {
      console.log(
        `Rate limited. Retrying in ${RETRY_DELAY}ms... (${retries} retries left)`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (retries > 0) {
      console.log(
        `Error occurred. Retrying in ${RETRY_DELAY}ms... (${retries} retries left)`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

exports.handler = async (event) => {
  console.log("Incoming request:", event);

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((url) => url.trim())
    : ["*"];

  const origin = event.headers.origin || "";

  const corsHeaders = {
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin)
      ? origin
      : allowedOrigins[0],
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: "",
    };
  }

  let requestBody;
  try {
    requestBody = JSON.parse(event.body);
    console.log("Parsed request body:", requestBody);
  } catch (e) {
    console.error("Failed to parse request body:", e);
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Invalid request body" }),
    };
  }

  const requiredFields = [
    "first_name",
    "last_name",
    "dob",
    "address",
    "website",
  ];
  for (const field of requiredFields) {
    if (!requestBody[field]) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: `Missing required field: ${field}` }),
      };
    }
  }

  const apiPayload = {
    customer_id: process.env.FASTDEBT_CUSTOMER_ID,
    customer_api_key: process.env.FASTDEBT_API_KEY,
    first_name: requestBody.first_name || "",
    last_name: requestBody.last_name || "",
    email: requestBody.email || "",
    phone: requestBody.phone || "",
    dob: requestBody.dob || "",
    ssn: requestBody.ssn || "",
    address: requestBody.address || "",
    website: requestBody.website || "",
  };

  console.log("API payload:", apiPayload);

  let creditApiResult = {};
  let zapierResult = {};

  try {
    creditApiResult = await fetchWithRetry(
      "https://api.fastdebt.com/v1/verify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.FASTDEBT_API_KEY,
        },
        body: JSON.stringify(apiPayload),
      }
    );

    console.log("Credit API response:", creditApiResult);
  } catch (error) {
    console.error(`Error during Credit API request: ${error.message}`);
    creditApiResult = { error: error.message };
  }

  function cleanValue(value) {
    if (typeof value === "string") {
      // Remove any remaining curly braces and replace placeholders with 'unknown'
      return value
        .replace(/{{|}}/g, "")
        .replace(/placement|campaign\.id|adset\.id|ad\.id|pid/g, "unknown");
    }
    return value;
  }

  // Then, when preparing the zapierData:
  const zapierData = {
    nts: creditApiResult.data?.balance_unsecured_accounts?.max || "N/A",
    balance_unsecured_credit_cards:
      creditApiResult.data?.balance_unsecured_credit_cards?.max || "N/A",
    creditScore: creditApiResult.data?.creditScore?.max || "N/A",
    api_error: creditApiResult.error || "N/A",
    // Clean the UTM fields
    channeldrilldown1: cleanValue(requestBody.channeldrilldown1) || "",
    channeldrilldown2: cleanValue(requestBody.channeldrilldown2) || "",
    channeldrilldown3: cleanValue(requestBody.channeldrilldown3) || "",
    channeldrilldown4: cleanValue(requestBody.channeldrilldown4) || "",
    channeldrilldown5: cleanValue(requestBody.channeldrilldown5) || "",
    channeldrilldown6: cleanValue(requestBody.channeldrilldown6) || "",
    ...requestBody,
    balance_unsecured_accounts:
      creditApiResult.data?.balance_unsecured_accounts?.max || "N/A",
  };

  try {
    zapierResult = await fetchWithRetry(process.env.ZAPIER_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(zapierData),
    });

    console.log("Zapier response:", zapierResult);
  } catch (zapierError) {
    console.error("Error submitting to Zapier:", zapierError);
    zapierResult = { error: zapierError.message };
  }

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      result: creditApiResult.data || {},
      zapierResult,
      error: creditApiResult.error || null,
    }),
  };
};
