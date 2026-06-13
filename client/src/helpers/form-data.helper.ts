export const toFormData = (object: Record<string, any>): FormData => {
  const formData = new FormData();

  Object.keys(object).forEach((key) => {
    const value = object[key];

    if (value === null || value === undefined) {
      return;
    }

    if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item instanceof File || item instanceof Blob) {
          formData.append(key, item);
        } else {
          formData.append(key, String(item));
        }
      });
    } else if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });

  return formData;
};
