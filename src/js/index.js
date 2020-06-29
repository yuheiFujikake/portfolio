import WebGLController from "./Component/Background/_WebGLController.js";

$(() => {
  const webGL = new WebGLController();
  webGL.init();

  const $theme = $(".js-theme");
  $(".js-theme-change").on('click', () => {
    if($theme.hasClass("theme-light")){
      $theme.addClass("theme-dark")
      $theme.removeClass("theme-light")
    }
    else {
      $theme.addClass("theme-light")
      $theme.removeClass("theme-dark")
    }
  });
});