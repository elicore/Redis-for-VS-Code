import { create } from 'zustand'
import { AxiosError } from 'axios'
import { commonMiddlewares } from 'uiSrc/store'
import { IFetchKeyArgs, RedisString } from 'uiSrc/interfaces'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import { getEncoding, getUrl, isStatusSuccessful } from 'uiSrc/utils'
import { StringActions, StringState } from './interface'

export const initialState: StringState = {
  loading: false,
  error: '',
  isCompressed: false,
  data: {
    key: '',
    value: null,
  },
}

export const useStringStore = create<StringState & StringActions>()(
  commonMiddlewares((set) => ({
    ...initialState,
    // actions
    resetStringStore: () => set(initialState),
    processString: () => set({ loading: true }),
    processStringFinal: () => set({ loading: false }),
    processStringSuccess: ({ keyName, value }: any) => set({ data: { key: keyName, value } }),
    setIsStringCompressed: (isCompressed) => set({ isCompressed }),
  })),
)

// async actions
export const fetchString = (key?: RedisString, args: IFetchKeyArgs = {}) =>
  useStringStore.setState(async (state) => {
    state.processString()

    try {
      const { data, status } = await apiService.post(
        getUrl(ApiEndpoints.STRING_VALUE),
        { keyName: key, ...args },
        { params: { encoding: getEncoding() } },
      )

      if (isStatusSuccessful(status)) {
        state.processStringSuccess(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      console.debug({ error })
    } finally {
      state.processStringFinal()
    }
  })

// export const updateStringValueAction = (
//   key?: RedisString,
//   value?: RedisResponseBuffer,
//   onSuccess?: () => void,
// ) =>
//   useStringStore.setState(async (state) => {
//     state.processString()

//     try {
//       const { data, status } = await apiService.put(
//         getUrl(ApiEndpoints.STRING_VALUE),
//         { keyName: key, value },
//         { params: { encoding: getEncoding() } },
//       )

//       if (isStatusSuccessful(status)) {
//         state.processStringSuccess(data)
//         onSuccess?.()
//       }
//     } catch (_err) {
//       const error = _err as AxiosError
//       console.debug({ error })
//     } finally {
//       state.processStringFinal()
//     }
//   })

// export const fetchDownloadStringValue = (
//   key?: RedisString,
//   onSuccess?: (data: string, headers: AxiosResponseHeaders) => void,
// ) =>
//   useStringStore.setState(async (state) => {
//     state.processString()

//     try {
//       const { data, status, headers } = await apiService.post(
//         getUrl(ApiEndpoints.STRING_VALUE_DOWNLOAD),
//         { keyName: key },
//         { responseType: 'arraybuffer' },
//       )

//       if (isStatusSuccessful(status)) {
//         // state.processStringSuccess(data)
//         onSuccess?.(data, headers as AxiosResponseHeaders)
//       }
//     } catch (_err) {
//       const error = _err as AxiosError
//       console.debug({ error })
//     } finally {
//       state.processStringFinal()
//     }
//   })
