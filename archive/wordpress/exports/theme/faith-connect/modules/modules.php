<?php
namespace FaithConnectSpace\Modules;

use FaithConnectSpace\Modules\CSS_Vars;
use FaithConnectSpace\Modules\Gutenberg;
use FaithConnectSpace\Modules\Swiper;
use FaithConnectSpace\Modules\Page_Preloader;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Theme modules.
 *
 * Main class for theme modules.
 */
class Modules {

	/**
	 * Theme modules constructor.
	 *
	 * Run modules for theme.
	 */
	public function __construct() {
		new CSS_Vars();

		new Swiper();

		new Gutenberg();

		new Page_Preloader();
	}

}
