import QRCode from 'qrcode'

const opts = {
  errorCorrectionLevel: 'L',
  version: 3,
  margin: 1,
  scale: 2
}



export async function generateQRURL(stock) {
  let good = stock.good
  let text = `${good.provider.id}|${good.id}|${good.code}|${stock.size}`
  return QRCode.toDataURL(text, opts)
}

function generateQR(el, stock) {
  let good = stock.good
  let text = `${good.provider.id}|${good.id}|${good.code}|${stock.size}`
  QRCode.toCanvas(el, text,
    opts,
    function(error) {
      if (error) {
        console.error(error)
      }
    }
  )
}

export default generateQR
