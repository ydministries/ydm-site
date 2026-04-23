<?php
namespace FaithConnectSpace\Kits\Settings\General;

use FaithConnectSpace\Kits\Settings\Base\Settings_Tab_Base;

use Elementor\Controls_Manager;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}


/**
 * Input settings.
 */
class Input extends Settings_Tab_Base {

	/**
	 * Get toggle name.
	 *
	 * Retrieve the toggle name.
	 *
	 * @return string Toggle name.
	 */
	public static function get_toggle_name() {
		return 'input';
	}

	/**
	 * Get title.
	 *
	 * Retrieve the toggle title.
	 */
	public function get_title() {
		return esc_html__( 'Form Fields', 'faith-connect' );
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
				'raw' => esc_html__( 'Used in: default form, Gutenberg editor.', 'faith-connect' ),
				'type' => Controls_Manager::RAW_HTML,
				'content_classes' => 'elementor-panel-alert elementor-panel-alert-info',
				'render_type' => 'ui',
			)
		);

		$this->add_var_group_control( '', self::VAR_TYPOGRAPHY );

		$this->add_controls_group( '', self::CONTROLS_STATES, array(
			'states' => array(
				'normal' => esc_html__( 'Normal', 'faith-connect' ),
				'focus' => esc_html__( 'Focus', 'faith-connect' ),
			),
		) );

		$this->add_responsive_control(
			'padding',
			array(
				'label' => esc_html__( 'Padding', 'faith-connect' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => array(
					'px',
					'em',
					'%',
				),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'padding_top' ) . ': {{TOP}}{{UNIT}};' .
						'--' . $this->get_control_prefix_parameter( '', 'padding_right' ) . ': {{RIGHT}}{{UNIT}};' .
						'--' . $this->get_control_prefix_parameter( '', 'padding_bottom' ) . ': {{BOTTOM}}{{UNIT}};' .
						'--' . $this->get_control_prefix_parameter( '', 'padding_left' ) . ': {{LEFT}}{{UNIT}};',
				),
			)
		);

		$this->add_control(
			'placeholder_color',
			array(
				'label' => esc_html__( 'Placeholder Color', 'faith-connect' ),
				'type' => Controls_Manager::COLOR,
				'dynamic' => array(),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'placeholder_color' ) . ': {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'label_heading_control',
			array(
				'label' => esc_html__( 'Label', 'faith-connect' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
			)
		);

		$this->add_var_group_control( 'label', self::VAR_TYPOGRAPHY );

		$this->add_control(
			'label_color',
			array(
				'label' => esc_html__( 'Color', 'faith-connect' ),
				'type' => Controls_Manager::COLOR,
				'dynamic' => array(),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'label_color' ) . ': {{VALUE}};',
				),
			)
		);
	}

}
