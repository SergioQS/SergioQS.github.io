$(document).ready(function () {
  // Init Masonry only for elements with .grid class (not used on about page)
  var $grid = $(".grid").masonry({
    gutter: 20,
    horizontalOrder: true,
    itemSelector: ".grid-item",
    columnWidth: ".col-lg-4",
    percentPosition: true
  });
  // Layout Masonry after each image loads
  $grid.imagesLoaded().progress(function () {
    $grid.masonry("layout");
  });
});
