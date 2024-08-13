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
    "Access-Control-Max-Age": "86400", // Cache preflight request for 86400 seconds
    "Content-Type": "application/json", // Add Content-Type header
  };

  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204, // No content response for preflight
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
    customer_id: process.env.FASTDEBT_CUSTOMER_ID, // Securely use environment variable
    customer_api_key: process.env.FASTDEBT_API_KEY, // Securely use environment variable
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

  try {
    const response = await fetch("https://api.fastdebt.com/v1/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.FASTDEBT_API_KEY, // Use environment variable for API key
      },
      body: JSON.stringify(apiPayload),
    });

    const result = await response.json();
    console.log("API response:", result);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error(`Error during API request: ${error.message}`);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
