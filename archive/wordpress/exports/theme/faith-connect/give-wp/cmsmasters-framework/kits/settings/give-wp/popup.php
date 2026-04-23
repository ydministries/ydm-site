<?php
namespace FaithConnectSpace\GiveWp\CmsmastersFramework\Kits\Settings\GiveWp;

use FaithConnectSpace\Kits\Settings\Base\Settings_Tab_Base;

use Elementor\Controls_Manager;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}


/**
 * Gutenberg settings.
 */
class Popup extends Settings_Tab_Base {

	/**
	 * Get toggle name.
	 *
	 * Retrieve the toggle name.
	 *
	 * @return string Toggle name.
	 */
	public static function get_toggle_name() {
		return 'popup';
	}

	/**
	 * Get title.
	 *
	 * Retrieve the toggle title.
	 */
	public function get_title() {
		return esc_html__( 'PopUp', 'faith-connect' );
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
		$this->add_controls_group( 'give_box', self::CONTROLS_CONTAINER_BOX, array(
			'popover' => false,
			'excludes' => array( 'alignment', 'margin', 'box_shadow' ),
		) );

		$this->add_responsive_control(
			'give_popup_width',
			array(
				'label' => esc_html__( 'Width', 'faith-connect' ),
				'type' => Controls_Manager::SLIDER,
				'range' => array(
					'%' => array(
						'min' => 0,
						'max' => 100,
					),
					'px' => array(
						'min' => 0,
						'max' => 1200,
					),
				),
				'size_units' => array(
					'%',
					'px',
				),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'give_width' ) . ': {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->add_responsive_control(
			'give_popup_height',
			array(
				'label' => esc_html__( 'Max Height', 'faith-connect' ),
				'type' => Controls_Manager::SLIDER,
				'range' => array(
					'vh' => array(
						'min' => 0,
						'max' => 100,
					),
					'px' => array(
						'min' => 0,
						'max' => 800,
					),
				),
				'size_units' => array(
					'vh',
					'px',
				),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'give_height' ) . ': {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->add_control(
			'give_popup_overlay_color',
			array(
				'label' => esc_html__( 'Overlay Color', 'faith-connect' ),
				'type' => Controls_Manager::COLOR,
				'dynamic' => array(),
				'separator' => 'before',
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'give_overlay_color' ) . ': {{VALUE}};',
				),
			)
		);
	}
}
