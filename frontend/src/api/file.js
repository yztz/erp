import { concatenateURL } from '@/utils'

const API_URL = concatenateURL(
  process.env.VUE_APP_API_BASE_URL,
  process.env.VUE_APP_API_PREFIX,
)

// export function getPictureURL(fileName) {
//   return new URL('/file/fetch/' + fileName, API_URL).toString()
// }

export function getUploadUrl() {
  return concatenateURL(
    API_URL,
    '/upload',
  )
}
