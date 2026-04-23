<?php
namespace FaithConnectSpace\GiveWp\CmsmastersFramework;

use FaithConnectSpace\Core\Utils\File_Manager;
use FaithConnectSpace\GiveWp\CmsmastersFramework\Kits\Kit as Plugin_Kit;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Plugin handler class is responsible for GiveWP different methods.
 */
class Plugin {

	private $css_path_prefix = 'give-wp/cmsmasters-framework/';

	/**
	 * Plugin constructor.
	 */
	public function __construct() {
		if ( ! class_exists( 'Give' ) ) {
			return;
		}

		new Plugin_Kit();

		add_filter( 'cmsmasters_stylesheet_templates_paths_filter', array( $this, 'stylesheet_templates_paths_filter' ) );

		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_styles' ) );
	}

	/**
	 * Stylesheet templates paths filter.
	 *
	 * @param array $templates_paths Templates paths.
	 *
	 * @return array Filtered templates paths.
	 */
	public function stylesheet_templates_paths_filter( $templates_paths ) {
		$path = File_Manager::get_responsive_css_path( $this->css_path_prefix );

		return array_merge( $templates_paths, array(
			$path . 'give-wp.css',
			$path . 'give-wp.min.css',
			$path . 'give-wp-rtl.css',
			$path . 'give-wp-rtl.min.css',
		) );
	}

	/**
	 * Enqueue theme compatibility styles.
	 *
	 * @param array $styles Array of registered styles.
	 *
	 * @return array
	 */
	public function enqueue_styles() {
		wp_enqueue_style(
			'faith-connect-give-wp',
			File_Manager::get_css_template_assets_url( 'give-wp', null, 'default', true, $this->css_path_prefix ),
			array(),
			'1.0.0'
		);
	}
}
