<?php
namespace FaithConnectSpace\Kits\Settings\Single;

use FaithConnectSpace\Kits\Controls\Controls_Manager as CmsmastersControls;
use FaithConnectSpace\Kits\Settings\Base\Settings_Tab_Base;

use Elementor\Controls_Manager;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}


/**
 * Single settings.
 */
class Single extends Settings_Tab_Base {

	/**
	 * Get toggle name.
	 *
	 * Retrieve the toggle name.
	 *
	 * @return string Toggle name.
	 */
	public static function get_toggle_name() {
		return 'single';
	}

	/**
	 * Get title.
	 *
	 * Retrieve the toggle title.
	 */
	public function get_title() {
		return esc_html__( 'Single', 'faith-connect' );
	}

	/**
	 * Get control ID prefix.
	 *
	 * Retrieve the control ID prefix.
	 *
	 * @return string Control ID prefix.
	 */
	protected static function get_control_id_prefix() {
		$toggle_name = self::get_toggle_name();

		return parent::get_control_id_prefix() . "_{$toggle_name}";
	}

	/**
	 * Register toggle controls.
	 *
	 * Registers the controls of the kit settings tab toggle.
	 */
	protected function register_toggle_controls() {
		$this->add_control(
			'notice',
			array(
				'raw' => esc_html__( "If you use an 'Singular' template, then the settings will not be applied, if you set the template to 'All Singular', then these settings will be hidden.", 'faith-connect' ),
				'type' => Controls_Manager::RAW_HTML,
				'content_classes' => 'elementor-panel-alert elementor-panel-alert-info',
				'render_type' => 'ui',
			)
		);

		$this->add_control(
			'layout',
			array(
				'label' => esc_html__( 'Layout', 'faith-connect' ),
				'label_block' => false,
				'description' => esc_html__( 'This setting will be applied after save and reload.', 'faith-connect' ),
				'type' => CmsmastersControls::CHOOSE_TEXT,
				'options' => array(
					'l-sidebar' => array(
						'title' => esc_html__( 'Left', 'faith-connect' ),
						'description' => esc_html__( 'Left Sidebar', 'faith-connect' ),
					),
					'fullwidth' => array(
						'title' => esc_html__( 'Full', 'faith-connect' ),
						'description' => esc_html__( 'Full Width', 'faith-connect' ),
					),
					'r-sidebar' => array(
						'title' => esc_html__( 'Right', 'faith-connect' ),
						'description' => esc_html__( 'Right Sidebar', 'faith-connect' ),
					),
				),
				'default' => $this->get_default_setting(
					$this->get_control_name_parameter( '', 'layout' ),
					'r-sidebar'
				),
				'toggle' => false,
			)
		);

		$this->add_control(
			'elements_heading_control',
			array(
				'label' => esc_html__( 'Elements Order', 'faith-connect' ),
				'type' => Controls_Manager::HEADING,
			)
		);

		$this->add_control(
			'elements',
			array(
				'label_block' => true,
				'show_label' => false,
				'description' => esc_html__( 'This setting will be applied after save and reload.', 'faith-connect' ),
				'type' => CmsmastersControls::SELECTIZE,
				'options' => array(
					'media' => esc_html__( 'Media', 'faith-connect' ),
					'title' => esc_html__( 'Title', 'faith-connect' ),
					'meta_first' => esc_html__( 'Meta Data 1', 'faith-connect' ),
					'meta_second' => esc_html__( 'Meta Data 2', 'faith-connect' ),
					'content' => esc_html__( 'Content', 'faith-connect' ),
				),
				'default' => $this->get_default_setting(
					$this->get_control_name_parameter( '', 'elements' ),
					array(
						'media',
						'title',
						'meta_first',
						'content',
						'meta_second',
					)
				),
				'multiple' => true,
			)
		);

		$this->add_control(
			'heading_visibility',
			array(
				'label' => esc_html__( 'Heading Visibility', 'faith-connect' ),
				'description' => esc_html__( 'This setting will be applied after save and reload.', 'faith-connect' ),
				'type' => Controls_Manager::SWITCHER,
				'label_off' => esc_html__( 'Hide', 'faith-connect' ),
				'label_on' => esc_html__( 'Show', 'faith-connect' ),
				'default' => $this->get_default_setting(
					$this->get_control_name_parameter( '', 'heading_visibility' ),
					'yes'
				),
			)
		);

		$this->add_control(
			'blocks_heading_control',
			array(
				'label' => esc_html__( 'Blocks Order', 'faith-connect' ),
				'type' => Controls_Manager::HEADING,
			)
		);

		$this->add_control(
			'blocks',
			array(
				'label_block' => true,
				'show_label' => false,
				'description' => esc_html__( 'This setting will be applied after save and reload.', 'faith-connect' ),
				'type' => CmsmastersControls::SELECTIZE,
				'options' => array(
					'nav' => esc_html__( 'Posts Navigation', 'faith-connect' ),
					'author' => esc_html__( 'Author Box', 'faith-connect' ),
					'more_posts' => esc_html__( 'More Posts', 'faith-connect' ),
				),
				'default' => $this->get_default_setting(
					$this->get_control_name_parameter( '', 'blocks' ),
					array(
						'nav',
						'author',
						'more_posts',
					)
				),
				'multiple' => true,
			)
		);

		$this->add_control(
			'apply_settings',
			array(
				'label_block' => true,
				'show_label' => false,
				'type' => Controls_Manager::BUTTON,
				'text' => esc_html__( 'Save & Reload', 'faith-connect' ),
				'event' => 'cmsmasters:theme_settings:apply_settings',
				'separator' => 'before',
			)
		);
	}

}
