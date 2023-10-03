import ky from 'ky-universal'

export const http = ky.create({
  timeout: false,
  retry: {
    limit: 0,
    methods: ['get'],
  },
})
