import Swal from "sweetalert2";

const PsychowaySwal = Swal.mixin({
  customClass: {
    popup: "psychoway-swal-popup",
    title: "psychoway-swal-title",
    htmlContainer: "psychoway-swal-html",
    confirmButton: "psychoway-swal-confirm-btn",
    cancelButton: "psychoway-swal-cancel-btn",
    input: "psychoway-swal-input",
  },
  buttonsStyling: false,
});

export const showSuccess = (title, text = "", options = {}) => {
  return PsychowaySwal.fire({
    icon: "success",
    title,
    text,
    showConfirmButton: false,
    timer: 2000,
    iconColor: "#0d825c",
    ...options,
  });
};

export const showError = (title, text = "", options = {}) => {
  return PsychowaySwal.fire({
    icon: "error",
    title,
    text,
    confirmButtonText: "Entendido",
    iconColor: "#ef4444",
    ...options,
  });
};

export const showWarning = (title, text = "", options = {}) => {
  return PsychowaySwal.fire({
    icon: "warning",
    title,
    text,
    confirmButtonText: "Aceptar",
    iconColor: "#f59e0b",
    ...options,
  });
};

export const showConfirm = (title, text = "", options = {}) => {
  return PsychowaySwal.fire({
    icon: "warning",
    title,
    html: text,
    showCancelButton: true,
    confirmButtonText: "Aceptar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    iconColor: "#ef4444",
    ...options,
  });
};

export const showPrompt = (title, text = "", options = {}) => {
  return PsychowaySwal.fire({
    title,
    text,
    input: "text",
    showCancelButton: true,
    confirmButtonText: "Aceptar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    ...options,
  });
};

const alerts = {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  confirm: showConfirm,
  prompt: showPrompt,
  fire: (options) => PsychowaySwal.fire(options),
};

export default alerts;
