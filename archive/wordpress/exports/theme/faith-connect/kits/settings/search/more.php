<?php
namespace FaithConnectSpace\Kits\Settings\Search;

use FaithConnectSpace\Kits\Settings\Base\Settings_Tab_Base;

use Elementor\Controls_Manager;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}


/**
 * Search More settings.
 */
class More extends Settings_Tab_Base {

	/**
	 * Get toggle name.
	 *
	 * Retrieve the toggle name.
	 *
	 * @return string Toggle name.
	 */
	public static function get_toggle_name() {
		return 'search_more';
	}

	/**
	 * Get title.
	 *
	 * Retrieve the toggle title.
	 */
	public function get_title() {
		return esc_html__( 'Read More', 'faith-connect' );
	}

	/**
	 * Get control ID prefix.
	 *
	 * Retrieve the control ID prefix.
	 *
	 * @return string Control ID prefix.
	 */
	protected static function get_control_id_prefix() {
		return parent::get_control_id_prefix() . '_search';
	}

	/**
	 * Get toggle conditions.
	 *
	 * Retrieve the settings toggle conditions.
	 *
	 * @return array Toggle conditions.
	 */
	protected function get_toggle_conditions() {
		return array(
			'conditions' => array(
				'relation' => 'or',
				'terms' => array(
					array(
						'relation' => 'and',
						'terms' => array(
							array(
								'name' => $this->get_control_id_parameter( '', 'type' ),
								'operator' => '===',
								'value' => 'large',
							),
							array(
								'name' => $this->get_control_id_parameter( '', 'large_elements' ),
								'operator' => 'contains',
								'value' => 'more',
							),
						),
					),
					array(
						'relation' => 'and',
						'terms' => array(
							array(
								'name' => $this->get_control_id_parameter( '', 'type' ),
								'operator' => '===',
								'value' => 'grid',
							),
							array(
								'name' => $this->get_control_id_parameter( '', 'grid_elements' ),
								'operator' => 'contains',
								'value' => 'more',
							),
						),
					),
					array(
						'relation' => 'and',
						'terms' => array(
							array(
								'name' => $this->get_control_id_parameter( '', 'type' ),
								'operator' => '===',
								'value' => 'compact',
							),
							array(
								'name' => $this->get_control_id_parameter( '', 'compact_elements' ),
								'operator' => 'contains',
								'value' => 'more',
							),
						),
					),
				),
			),
		);
	}

	/**
	 * Register toggle controls.
	 *
	 * Registers the controls of the kit settings tab toggle.
	 */
	protected function register_toggle_controls() {
		$this->add_controls_group( 'more', self::CONTROLS_BUTTON_ICON, array(
			'link' => false,
			'states' => array(
				'normal' => esc_html__( 'Normal', 'faith-connect' ),
				'hover' => esc_html__( 'Hover', 'faith-connect' ),
			),
			'placeholder' => esc_html__( 'Read more', 'faith-connect' ),
		) );

		$this->add_controls_group( 'more_box', self::CONTROLS_CONTAINER_BOX, array(
			'excludes' => array( 'box_shadow' ),
		) );

		$this->add_control(
			'more_apply_settings',
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
