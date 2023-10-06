import ky from 'ky'

export const http: typeof ky = ky.create({
  timeout: false,
  retry: {
    limit: 0,
    methods: ['get'],
  },
})
