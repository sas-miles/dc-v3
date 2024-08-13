const twilio = require("twilio");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

exports.handler = async (event) => {
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

  let phoneNumber = event.queryStringParameters.phoneNumber;
  console.log(`Received phone number: ${phoneNumber}`);

  // Remove all non-digit characters
  phoneNumber = phoneNumber.replace(/\D/g, "");

  // Ensure phone number has a country code (assuming US numbers for this example)
  if (!phoneNumber.startsWith("1")) {
    phoneNumber = `1${phoneNumber}`; // Add country code for US numbers if not present
  }

  phoneNumber = `+${phoneNumber}`; // Prepend the + symbol for E.164 format
  console.log(`Formatted phone number: ${phoneNumber}`);

  try {
    const lookup = await client.lookups.v2
      .phoneNumbers(phoneNumber)
      .fetch({ fields: "line_type_intelligence" });
    console.log(`Lookup result: ${JSON.stringify(lookup)}`);

    if (!lookup || !lookup.lineTypeIntelligence) {
      console.error("Line type intelligence information is not available.");
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          valid: false,
          error: "Line type intelligence information is not available.",
        }),
      };
    }

    const isMobile = lookup.lineTypeIntelligence.type === "mobile";
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ valid: isMobile }),
    };
  } catch (error) {
    console.error(`Error during lookup: ${error.message}`);
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ valid: false, error: error.message }),
    };
  }
};
