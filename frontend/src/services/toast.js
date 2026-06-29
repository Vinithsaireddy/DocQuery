let globalDispatch = null;

export const setGlobalDispatch = (dispatch) => {
  globalDispatch = dispatch;
};

export const toast = {
  success: (msg, opts) => globalDispatch?.({ type: 'ADD', payload: { type: 'success', message: msg, ...opts } }),
  error:   (msg, opts) => globalDispatch?.({ type: 'ADD', payload: { type: 'error',   message: msg, ...opts } }),
  info:    (msg, opts) => globalDispatch?.({ type: 'ADD', payload: { type: 'info',    message: msg, ...opts } }),
  warning: (msg, opts) => globalDispatch?.({ type: 'ADD', payload: { type: 'warning', message: msg, ...opts } }),
};
