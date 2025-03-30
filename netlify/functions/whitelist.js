const fs = require("fs");
const path = require("path");

exports.handler = async () => {
    try {
        // Read the whitelist.json file from the root directory
        const filePath = path.resolve(__dirname, "../../whitelist.json");
        const data = fs.readFileSync(filePath, "utf8");

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: data
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Error reading whitelist.json", details: error.message })
        };
    }
};
