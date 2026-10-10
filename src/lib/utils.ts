export type DebouncedFunction<TArgs extends unknown[]> = ((...args: TArgs) => void) & {
  cancel: () => void;
};

export function debounce(
  callback: (value: string) => void,
  delay: number,
) {
  let timeoutId: ReturnType<typeof setTimeout>;

  const debounced = (value: string) => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      callback(value);
    }, delay);
  };

  debounced.cancel = () => {
    clearTimeout(timeoutId);
  };

  return debounced;
}
