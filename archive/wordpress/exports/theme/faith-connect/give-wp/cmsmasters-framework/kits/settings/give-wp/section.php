<?php
namespace FaithConnectSpace\GiveWp\CmsmastersFramework\Kits\Settings\GiveWp;

use FaithConnectSpace\GiveWp\CmsmastersFramework\Kits\Kit as Plugin_Kit;
use FaithConnectSpace\Kits\Settings\Base\Base_Section;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}


/**
 * Elements section.
 */
class Section extends Base_Section {

	/**
	 * Get name.
	 *
	 * Retrieve the section name.
	 */
	public static function get_name() {
		return 'give-wp';
	}

	/**
	 * Get title.
	 *
	 * Retrieve the section title.
	 */
	public static function get_title() {
		return esc_html__( 'GiveWp', 'faith-connect' );
	}

	/**
	 * Get icon.
	 *
	 * Retrieve the section icon.
	 */
	public static function get_icon() {
		return 'eicon-plug';
	}

	/**
	 * Get toggles.
	 *
	 * Retrieve the section toggles.
	 */
	public static function get_toggles() {
		return array(
			'forms',
			'popup',
		);
	}

	/**
	 * Get kit namespace.
	 *
	 * @return string Kit namespace.
	 */
	public function get_kit_namespace() {
		return Plugin_Kit::KIT_NAMESPACE;
	}

}
