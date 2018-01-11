var express = import('express')
var app = express()
var json = {
    code: 200,
    msg: '请求成功',
    data: {
        userId: '123456',
        name: 'Terry',
        blog: 'https://yunm.coding.me'
    }
}
app.get("/", function (req, res) {
    res.send(json)
})
app.listen(5438, function () {
    console.log("启动服务 http://localhost:5438 ")
})