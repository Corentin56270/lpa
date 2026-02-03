const { DateTime } = require("luxon");
const markdownIt = require("markdown-it");

module.exports = function(eleventyConfig) {
    const md = new markdownIt({
        html: true
    });

    eleventyConfig.addPassthroughCopy("./src/styles");
    eleventyConfig.addPassthroughCopy("./src/media");
    eleventyConfig.addPassthroughCopy("./scripts");
    eleventyConfig.addPassthroughCopy("./src/admin");

    eleventyConfig.addFilter("markdown", (content) => {
        return md.render(content);
    });

    eleventyConfig.addFilter("postDate", (dateObj) => {
        return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED);
    });

    eleventyConfig.addFilter("postDateIso", (dateObj) => {
        return DateTime.fromJSDate(dateObj).toISODate();
    });

    return {
        dir: {
            input: "src",
            output: "public"
        }
    };
}