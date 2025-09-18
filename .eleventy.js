module.exports = function(eleventyConfig) {

    eleventyConfig.addPassthroughCopy("./src/styles");
    eleventyConfig.addPassthroughCopy("./src/media");

    return {
        dir: {
            input: "src",
            output: "public"
        }
    };
}