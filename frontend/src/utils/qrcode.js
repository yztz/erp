import QRCode from 'qrcode'


function generateQR(el, stock) {
    let good = stock.good
    let text = `${good.provider.id}|${good.id}|${good.code}|${stock.size}`
    QRCode.toCanvas(el, text, 
        {
            errorCorrectionLevel: 'L',
            version: 3,
            margin: 1,
            scale: 2
        },
        function (error) {
            if (error) {
                console.error(error)
            }
            let canvas = el
            var ctx = canvas.getContext('2d');

            // 设置文本属性
            // ctx.font = 'bold 15px Arial';  // 加粗
            // ctx.fillStyle = 'black';  // 设置为黑色
            // ctx.textAlign = 'center';
            

            // 在二维码下方添加标题
            // ctx.fillText(`${good.provider.name}asdadas`, canvas.width / 2, 20);
            // ctx.fillText(`${good.code}  ${good.color}  ${stock.size}`, canvas.width / 2, canvas.height - 15);
        }
    )
}


export default generateQR
