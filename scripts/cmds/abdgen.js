const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "abdgen",
    aliases: ["abd"],
    author: "SiFu",
    version: "1.0",
    cooldowns: 20,
    role: 0,
    shortDescription: "Generate an image using abdgen",
    longDescription: "Generates an image based on the provided prompt using the Abdgen API and streams the resulting image to the chat.",
    category: "img gen",
    guide: "Use the command followed by a prompt to generate an image. Example: ,abd a little anime girl",
  },
  onStart: async function ({ message, args, api, event }) {
    const prompt = args.join(" ");

    if (!prompt) {
      return api.sendMessage("ᯓᡣ𐭩 You must provide a prompt to generate an image.", event.threadID, event.messageID);
    }

    const startTime = Date.now(); 
    api.sendMessage("ᯓᡣ𐭩 Generating your img..ᐟ", event.threadID, event.messageID);

    try {
      const payload = {
        job: {
          name: "sd-lcm",
          data: {
            model_version: "sd-1.5-dreamshaper-8",
            lcm_lora_scale: 1,
            guidance_scale: 1.5,
            strength: 1,
            prompt: prompt,
            negativePrompt: "naked, nude, sexy, monochrome, lowres, bad anatomy, low quality",
            prompts: [],
            seed: Math.floor(Math.random() * 1e7), // Generate a random seed
            width: 512,
            height: 512,
            num_steps: 5,
            crop_init_image: true,
          },
        },
        environment: null,
        browserToken: "VMUmmL9HIwgCeWcGzQdS",
      };

      // Make the POST request
      const response = await axios.post(
        "https://www.artbreeder.com/api/realTimeJobs",
        payload,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Origin: "https://artbreeder.com",
            Referer: "https://www.artbreeder.com/create/prompter",
            "User-Agent":
              "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
          },
        }
      );

      
      const imageUrl = response?.data?.url;

      if (!imageUrl) {
        return api.sendMessage("ᯓᡣ𐭩 | Failed to generate the image. Please try again later.", event.threadID);
      }

    
      const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });

    
      const cacheFolderPath = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }

      const imagePath = path.join(cacheFolderPath, `${Date.now()}_artbreeder_image.jpeg`);
      fs.writeFileSync(imagePath, Buffer.from(imageResponse.data, "binary"));

     
      const stream = fs.createReadStream(imagePath);

     
      const generationTime = ((Date.now() - startTime) / 1000).toFixed(2); 

     
      message.reply({
        body: `꒷꒦︶꒷꒦꒷꒦︶꒷꒦๋ `,
        attachment: stream,
      });

    } catch (error) {
      console.error("Error:", error);
      return api.sendMessage("ᯓᡣ𐭩 | An error occurred while generating the image. Please try again later.", event.threadID);
    }
  },
};