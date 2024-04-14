
const API_URL = new URL(process.env.VUE_APP_API_PREFIX, new URL(process.env.VUE_APP_API_BASE_URL)).toString()

// export function getPictureURL(fileName) {
//   return new URL('/file/fetch/' + fileName, API_URL).toString()
// }

export function getUploadUrl() {
  return API_URL + '/upload'
}
