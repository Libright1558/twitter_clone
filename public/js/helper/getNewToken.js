const gainNewAccessToken = () => {
  return fetch('/refresh', {
    credentials: 'include',
    method: 'GET'
  })
}

export {
  gainNewAccessToken
}
