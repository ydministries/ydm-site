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
class Forms extends Settings_Tab_Base {

	/**
	 * Get toggle name.
	 *
	 * Retrieve the toggle name.
	 *
	 * @return string Toggle name.
	 */
	public static function get_toggle_name() {
		return 'forms';
	}

	/**
	 * Get title.
	 *
	 * Retrieve the toggle title.
	 */
	public function get_title() {
		return esc_html__( 'Forms', 'faith-connect' );
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
		$this->add_responsive_control(
			'give_forms_section_gap',
			array(
				'label' => esc_html__( 'Section Gap', 'faith-connect' ),
				'type' => Controls_Manager::SLIDER,
				'range' => array(
					'%' => array(
						'min' => 0,
						'max' => 100,
					),
					'px' => array(
						'min' => 0,
						'max' => 100,
					),
					'rem' => array(
						'min' => 0,
						'max' => 10,
					),
				),
				'size_units' => array(
					'%',
					'px',
					'rem',
				),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'give_forms_section_gap' ) . ': {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->add_control(
			'give_heading_control',
			array(
				'label' => esc_html__( 'Heading', 'faith-connect' ),
				'type' => Controls_Manager::HEADING,
			)
		);

		$this->add_var_group_control( 'forms_give_heading', self::VAR_TYPOGRAPHY );

		$this->add_control(
			'give_heading_color',
			array(
				'label' => esc_html__( 'Heading Color', 'faith-connect' ),
				'type' => Controls_Manager::COLOR,
				'dynamic' => array(),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'give_heading_color' ) . ': {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'give_separator_color',
			array(
				'label' => esc_html__( 'Separator Color', 'faith-connect' ),
				'type' => Controls_Manager::COLOR,
				'dynamic' => array(),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'give_separator_color' ) . ': {{VALUE}};',
				),
			)
		);

		$this->add_responsive_control(
			'give_separator_width',
			array(
				'label' => esc_html__( 'Separator Width', 'faith-connect' ),
				'type' => Controls_Manager::SLIDER,
				'range' => array(
					'px' => array(
						'min' => 0,
						'max' => 20,
					),
				),
				'size_units' => array(
					'px',
				),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'give_separator_width' ) . ': {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->add_responsive_control(
			'give_separator_gap',
			array(
				'label' => esc_html__( 'Separator Gap', 'faith-connect' ),
				'type' => Controls_Manager::SLIDER,
				'range' => array(
					'%' => array(
						'min' => 0,
						'max' => 100,
					),
					'px' => array(
						'min' => 0,
						'max' => 100,
					),
					'rem' => array(
						'min' => 0,
						'max' => 10,
					),
				),
				'size_units' => array(
					'%',
					'px',
					'rem',
				),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'give_separator_gap' ) . ': {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->add_control(
			'give_goal_control_heading',
			array(
				'label' => esc_html__( 'Goal', 'faith-connect' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
			)
		);

		$this->add_var_group_control( 'give_goal_title', self::VAR_TYPOGRAPHY );

		$this->add_control(
			'give_goal_color_title',
			array(
				'label' => esc_html__( 'Title Color', 'faith-connect' ),
				'type' => Controls_Manager::COLOR,
				'dynamic' => array(),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'give_goal_color_title' ) . ': {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'give_progress_bar_color',
			array(
				'label' => esc_html__( 'Progress Bar Color', 'faith-connect' ),
				'type' => Controls_Manager::COLOR,
				'dynamic' => array(),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'give_progress_bar_color' ) . ': {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'give_progress_bar_bg_color',
			array(
				'label' => esc_html__( 'Progress Bar Background Color', 'faith-connect' ),
				'type' => Controls_Manager::COLOR,
				'dynamic' => array(),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'give_progress_bar_bg_color' ) . ': {{VALUE}};',
				),
			)
		);

		$this->add_responsive_control(
			'give_progress_gap',
			array(
				'label' => esc_html__( 'Progress Bar Gap', 'faith-connect' ),
				'type' => Controls_Manager::SLIDER,
				'range' => array(
					'%' => array(
						'min' => 0,
						'max' => 100,
					),
					'px' => array(
						'min' => 0,
						'max' => 100,
					),
					'rem' => array(
						'min' => 0,
						'max' => 10,
					),
				),
				'size_units' => array(
					'%',
					'px',
					'rem',
				),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'give_progress_gap' ) . ': {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->add_control(
			'give_content_control_heading',
			array(
				'label' => esc_html__( 'Content', 'faith-connect' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
			)
		);

		$this->add_var_group_control( 'give_content', self::VAR_TYPOGRAPHY );

		$this->add_control(
			'give_content_color',
			array(
				'label' => esc_html__( 'Color', 'faith-connect' ),
				'type' => Controls_Manager::COLOR,
				'dynamic' => array(),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'give_content_color' ) . ': {{VALUE}};',
				),
			)
		);

		$this->add_responsive_control(
			'give_content_gap',
			array(
				'label' => esc_html__( 'Gap', 'faith-connect' ),
				'type' => Controls_Manager::SLIDER,
				'range' => array(
					'%' => array(
						'min' => 0,
						'max' => 100,
					),
					'px' => array(
						'min' => 0,
						'max' => 100,
					),
					'rem' => array(
						'min' => 0,
						'max' => 10,
					),
				),
				'size_units' => array(
					'%',
					'px',
					'rem',
				),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'give_content_gap' ) . ': {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->add_control(
			'give_titles_control_heading',
			array(
				'label' => esc_html__( 'Titles', 'faith-connect' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
			)
		);

		$this->add_var_group_control( 'give_titles', self::VAR_TYPOGRAPHY );

		$this->add_control(
			'give_titles_color',
			array(
				'label' => esc_html__( 'Color', 'faith-connect' ),
				'type' => Controls_Manager::COLOR,
				'dynamic' => array(),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'give_titles_color' ) . ': {{VALUE}};',
				),
			)
		);

		$this->add_responsive_control(
			'give_titles_gap',
			array(
				'label' => esc_html__( 'Gap', 'faith-connect' ),
				'type' => Controls_Manager::SLIDER,
				'range' => array(
					'%' => array(
						'min' => 0,
						'max' => 100,
					),
					'px' => array(
						'min' => 0,
						'max' => 100,
					),
					'rem' => array(
						'min' => 0,
						'max' => 10,
					),
				),
				'size_units' => array(
					'%',
					'px',
					'rem',
				),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'give_titles_gap' ) . ': {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->add_control(
			'give_fields_heading_control',
			array(
				'label' => esc_html__( 'Fields', 'faith-connect' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
			)
		);

		$this->add_var_group_control( 'give_fields', self::VAR_TYPOGRAPHY );

		$this->add_controls_group( 'give_fields', self::CONTROLS_STATES, array(
			'states' => array(
				'normal' => esc_html__( 'Normal', 'faith-connect' ),
				'focus' => esc_html__( 'Focus', 'faith-connect' ),
			),
		) );

		$this->add_responsive_control(
			'give_fields_padding',
			array(
				'label' => esc_html__( 'Padding', 'faith-connect' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => array(
					'px',
					'em',
					'%',
				),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( 'give_fields', 'padding-top' ) . ': {{TOP}}{{UNIT}};' .
						'--' . $this->get_control_prefix_parameter( 'give_fields', 'padding-right' ) . ': {{RIGHT}}{{UNIT}};' .
						'--' . $this->get_control_prefix_parameter( 'give_fields', 'padding-bottom' ) . ': {{BOTTOM}}{{UNIT}};' .
						'--' . $this->get_control_prefix_parameter( 'give_fields', 'padding-left' ) . ': {{LEFT}}{{UNIT}};',
				),
			)
		);

		$this->add_control(
			'give_placeholder_color',
			array(
				'label' => esc_html__( 'Placeholder Color', 'faith-connect' ),
				'type' => Controls_Manager::COLOR,
				'dynamic' => array(),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'give_fields' ) . ': {{VALUE}};',
				),
			)
		);

		$this->add_responsive_control(
			'give_currency_gap',
			array(
				'label' => esc_html__( 'Currency Gap', 'faith-connect' ),
				'type' => Controls_Manager::SLIDER,
				'range' => array(
					'px' => array(
						'min' => 0,
						'max' => 100,
					),
					'rem' => array(
						'min' => 0,
						'max' => 10,
					),
				),
				'size_units' => array(
					'px',
					'rem',
				),
				'separator' => 'before',
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'give_currency_gap' ) . ': {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->add_responsive_control(
			'give_fields_row_gap',
			array(
				'label' => esc_html__( 'Row Gap', 'faith-connect' ),
				'type' => Controls_Manager::SLIDER,
				'range' => array(
					'%' => array(
						'min' => 0,
						'max' => 100,
					),
					'px' => array(
						'min' => 0,
						'max' => 100,
					),
					'rem' => array(
						'min' => 0,
						'max' => 10,
					),
				),
				'size_units' => array(
					'%',
					'px',
					'rem',
				),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'give_fields_row_gap' ) . ': {{SIZE}}{{UNIT}};',
				),
			)
		);
		
		$this->add_responsive_control(
			'give_fields_column_gap',
			array(
				'label' => esc_html__( 'Column Gap', 'faith-connect' ),
				'type' => Controls_Manager::SLIDER,
				'range' => array(
					'%' => array(
						'min' => 0,
						'max' => 100,
					),
					'px' => array(
						'min' => 0,
						'max' => 100,
					),
					'rem' => array(
						'min' => 0,
						'max' => 10,
					),
				),
				'size_units' => array(
					'%',
					'px',
					'rem',
				),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'give_fields_column_gap' ) . ': {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->add_control(
			'give_labels_control_heading',
			array(
				'label' => esc_html__( 'Labels', 'faith-connect' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
			)
		);

		$this->add_var_group_control( 'give_labels', self::VAR_TYPOGRAPHY );

		$this->add_control(
			'give_labels_color',
			array(
				'label' => esc_html__( 'Color', 'faith-connect' ),
				'type' => Controls_Manager::COLOR,
				'dynamic' => array(),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'give_labels_color' ) . ': {{VALUE}};',
				),
			)
		);

		$this->add_responsive_control(
			'give_labels_gap',
			array(
				'label' => esc_html__( 'Gap', 'faith-connect' ),
				'type' => Controls_Manager::SLIDER,
				'range' => array(
					'%' => array(
						'min' => 0,
						'max' => 100,
					),
					'px' => array(
						'min' => 0,
						'max' => 100,
					),
					'rem' => array(
						'min' => 0,
						'max' => 10,
					),
				),
				'size_units' => array(
					'%',
					'px',
					'rem',
				),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'give_labels_gap' ) . ': {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->add_control(
			'give_donation_total_control_heading',
			array(
				'label' => esc_html__( 'Donation Total', 'faith-connect' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
			)
		);

		$this->add_var_group_control( 'give_donation_total', self::VAR_TYPOGRAPHY );

		$this->add_control(
			'give_donation_total_color',
			array(
				'label' => esc_html__( 'Color', 'faith-connect' ),
				'type' => Controls_Manager::COLOR,
				'dynamic' => array(),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'give_donation_total_color' ) . ': {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'give_amount_button_control_heading',
			array(
				'label' => esc_html__( 'Amount Button', 'faith-connect' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
			)
		);

		$this->add_controls_group( 'give_amount_button', self::CONTROLS_BUTTONS, array(
			'states' => array(
				'normal' => esc_html__( 'Normal', 'faith-connect' ),
				'hover' => esc_html__( 'Hover', 'faith-connect' ),
			),
		) );

		$this->add_responsive_control(
			'give_amount_button_gap',
			array(
				'label' => esc_html__( 'Gap', 'faith-connect' ),
				'type' => Controls_Manager::SLIDER,
				'range' => array(
					'%' => array(
						'min' => 0,
						'max' => 100,
					),
					'px' => array(
						'min' => 0,
						'max' => 100,
					),
					'rem' => array(
						'min' => 0,
						'max' => 10,
					),
				),
				'size_units' => array(
					'%',
					'px',
					'rem',
				),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'give_amount_button_gap' ) . ': {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->add_control(
			'give_donate_button_control_heading',
			array(
				'label' => esc_html__( 'Donate Button', 'faith-connect' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
			)
		);

		$this->add_controls_group( 'give_donate_button', self::CONTROLS_BUTTONS, array(
			'states' => array(
				'normal' => esc_html__( 'Normal', 'faith-connect' ),
				'hover' => esc_html__( 'Hover', 'faith-connect' ),
			),
		) );
	}

}
