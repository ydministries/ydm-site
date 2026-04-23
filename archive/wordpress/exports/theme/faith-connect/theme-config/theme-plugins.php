<?php
namespace FaithConnectSpace\ThemeConfig;

use FaithConnectSpace\Woocommerce\CmsmastersFramework\Plugin as Woocommerce_Plugin;
use FaithConnectSpace\GiveWp\CmsmastersFramework\Plugin as Give_Wp_Plugin;
use FaithConnectSpace\TribeEvents\CmsmastersFramework\Plugin as Tribe_Events_Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Theme Plugins.
 *
 * Main class for theme plugins.
 */
class Theme_Plugins {

	/**
	 * Theme_Plugins constructor.
	 */
	public function __construct() {
		new Woocommerce_Plugin();
		new Give_Wp_Plugin();
		new Tribe_Events_Plugin();
	}

}
