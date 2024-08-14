const fetch = require("node-fetch");

exports.handler = async (event) => {
  console.log("Incoming request:", event);

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((url) => url.trim())
    : ["*"];

  const origin = event.headers.origin || "";

  // Define CORS headers for cross-origin requests
  const corsHeaders = {
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin)
      ? origin
      : allowedOrigins[0],
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Content-Type": "application/json",
  };

  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: "",
    };
  }

  // Parse the request body
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

  // Ensure required fields are present
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
    const response = await fetch("https://api.fastdebt.com/v1/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.FASTDEBT_API_KEY,
      },
      body: JSON.stringify(apiPayload),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    creditApiResult = await response.json();
    console.log("Credit API response:", creditApiResult);
  } catch (error) {
    console.error(`Error during Credit API request: ${error.message}`);
    creditApiResult = { error: error.message };
  }

  // Prepare data for Zapier
  const zapierData = {
    ...requestBody,
    balance_unsecured_accounts:
      creditApiResult.data?.balance_unsecured_accounts?.max || "N/A",
    balance_unsecured_credit_cards:
      creditApiResult.data?.balance_unsecured_credit_cards?.max || "N/A",
    creditScore: creditApiResult.data?.creditScore?.max || "N/A",
    api_error: creditApiResult.error || "N/A",
  };

  // Send data to Zapier
  try {
    const zapierResponse = await fetch(process.env.ZAPIER_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(zapierData),
    });

    zapierResult = await zapierResponse.json();
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
