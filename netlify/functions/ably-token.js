// netlify/functions/ably-token.js
exports.handler = async (event) => {
  const key = process.env.ABLY_API_KEY;
  if (!key) return { statusCode: 500, body: "Missing ABLY_API_KEY" };

  const clientId = (event.queryStringParameters?.clientId || "anon")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 18) || "anon";

  const keyName = key.split(":")[0];
  const auth = Buffer.from(key).toString("base64");
  const channel = "global-chat";

  const resp = await fetch(
    `https://rest.ably.io/keys/${encodeURIComponent(keyName)}/requestToken`,
    {
      method: "POST",
      headers: {
        authorization: `Basic ${auth}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        keyName,
        clientId,
        capability: { [channel]: ["publish", "subscribe"] },
      }),
    }
  );

  const body = await resp.text();
  return {
    statusCode: resp.status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
    body,
  };
};
