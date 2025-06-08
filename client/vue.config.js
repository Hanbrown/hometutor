module.exports = {
    pages: {
        index: {
            entry: "src/index/main.js",
            template: "public/index.html",
            filename: "index.html",
            title: "Student Management System"
        },
        manage: "src/manage/main.js"
    },
    outputDir: "build",
}