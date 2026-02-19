type Listener = () => void;

const listeners = new Set<Listener>();
let activeCount = 0;
let isVisible = false;
let timer: ReturnType<typeof setTimeout> | null = null;
const delayMs = 450;

const notify = () => {
  listeners.forEach((listener) => listener());
};

const show = () => {
  if (isVisible) return;
  isVisible = true;
  notify();
};

const hide = () => {
  if (!isVisible) return;
  isVisible = false;
  notify();
};

export const beginGlobalLoading = () => {
  activeCount += 1;
  if (activeCount !== 1) return;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  timer = setTimeout(() => {
    if (activeCount > 0) {
      show();
    }
  }, delayMs);
};

export const endGlobalLoading = () => {
  if (activeCount > 0) {
    activeCount -= 1;
  }
  if (activeCount > 0) return;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  hide();
};

export const subscribeGlobalLoading = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getGlobalLoadingSnapshot = () => isVisible;
