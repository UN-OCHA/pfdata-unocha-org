(function($) {
    "use strict";

    // Add active state to sidbar nav links
    var path = window.location.href; // because the 'href' property of the DOM element is the absolute path
    $("#layoutSidenav_nav .sb-sidenav a.nav-link").each(function() {
        //if (this.href === path) {
        // $(this).addClass("active");
        // }
    });

    // Toggle the side navigation
    $("#sidebarToggle").on("click", function(e) {
        e.preventDefault();
        $("body").toggleClass("sb-sidenav-toggled");
    });
	
	$(window).resize(function () {
        ToggleSideNav();
    });

    var ToggleSideNav = function () {
        var $body = $('body');
        if (window.innerWidth <= 992) $body.addClass('sb-sidenav-toggled');
        else $body.removeClass('sb-sidenav-toggled');
    };

    ToggleSideNav();

})(jQuery);