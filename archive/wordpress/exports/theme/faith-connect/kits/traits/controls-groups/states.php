<?php
namespace FaithConnectSpace\Kits\Traits\ControlsGroups;

use FaithConnectSpace\Kits\Settings\Base\Settings_Tab_Base;

use Elementor\Controls_Manager;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}


/**
 * States trait.
 *
 * Allows to use a group of controls for states.
 */
trait States {

	/**
	 * Group of controls for states.
	 *
	 * @param string $key Controls key.
	 * @param array $args Controls args.
	 */
	protected function controls_group_states( $key = '', $args = array() ) {
		list(
			$states,
			$heading,
			$heading_separator,
			$icon_states,
			$background,
			$color,
			$border,
			$bd_radius,
			$text_decoration_states,
			$text_shadow,
			$box_shadow,
			$condition,
			$conditions
		) = $this->get_controls_group_required_args( $args, array(
			'states' => array(), // Controls states
			'heading' => false, // Controls heading
			'heading_separator' => 'before', // Controls separator
			'icon_states' => array(), // array - states where show icon control; 'out' - if icon control is out of states; empty array - if icon control isn't in use.
			'background' => 'color', // color - only color, gradient - the ability to select a gradient, false - hide control
			'color' => true, // true - show control, false - hide control
			'border' => true, // true - show control, false - hide control
			'bd_radius' => true, // true - show control, false - hide control
			'text_decoration_states' => array(), // array - states where show control; empty array - if control isn't in use.
			'text_shadow' => false, // true - show control, false - hide control
			'box_shadow' => true, // true - show control, false - hide control
			'condition' => array(), // Controls condition
			'conditions' => array(), // Controls conditions
		) );

		$default_args = array(
			'condition' => $condition,
			'conditions' => $conditions,
		);

		if ( 'out' === $icon_states ) {
			$this->add_control(
				$this->get_control_name_parameter( $key, 'icon' ),
				array_merge_recursive(
					$default_args,
					array(
						'label' => esc_html__( 'Icon', 'faith-connect' ),
						'description' => esc_html__( 'This setting will be applied after save and reload.', 'faith-connect' ),
						'type' => Controls_Manager::ICONS,
					)
				)
			);
		}

		if ( $heading ) {
			$this->add_control(
				$this->get_control_name_parameter( $key, 'states_tabs_heading_control' ),
				array_merge_recursive(
					$default_args,
					array(
						'label' => esc_html__( 'States', 'faith-connect' ),
						'type' => Controls_Manager::HEADING,
						'separator' => $heading_separator,
					)
				)
			);
		}

		$this->start_controls_tabs(
			$this->get_control_name_parameter( $key, 'states_tabs' ),
			$default_args
		);

		foreach ( $states as $state_key => $state_label ) {
			$this->start_controls_tab(
				$this->get_control_name_parameter( $key, "states_{$state_key}_tab" ),
				array( 'label' => $state_label )
			);

			if (
				is_array( $icon_states ) &&
				! empty( $icon_states ) &&
				in_array( $state_key, $icon_states, true )
			) {
				$this->add_control(
					$this->get_control_name_parameter( $key, "{$state_key}_icon" ),
					array(
						'label' => esc_html__( 'Icon', 'faith-connect' ),
						'description' => esc_html__( 'This setting will be applied after save and reload.', 'faith-connect' ),
						'type' => Controls_Manager::ICONS,
					)
				);
			}

			if ( 'gradient' === $background ) {
				$this->add_control(
					$this->get_control_name_parameter( $key, "{$state_key}_colors_bg_type" ),
					array(
						'label' => _x( 'Background Type', 'Background Control', 'faith-connect' ),
						'type' => Controls_Manager::CHOOSE,
						'options' => array(
							'classic' => array(
								'title' => _x( 'Classic', 'Background Control', 'faith-connect' ),
								'icon' => 'eicon-paint-brush',
							),
							'gradient' => array(
								'title' => _x( 'Gradient', 'Background Control', 'faith-connect' ),
								'icon' => 'eicon-barcode',
							),
						),
						'default' => 'classic',
						'frontend_available' => true,
					)
				);

				$this->add_control(
					$this->get_control_name_parameter( $key, "{$state_key}_colors_bg" ),
					array(
						'label' => _x( 'Background', 'Background Control', 'faith-connect' ),
						'type' => Controls_Manager::COLOR,
						'dynamic' => array(),
						'selectors' => array(
							':root' => '--' . $this->get_control_prefix_parameter( $key, "{$state_key}_colors_bg" ) . ': {{VALUE}};',
						),
						'condition' => array(
							$this->get_control_id_parameter( $key, "{$state_key}_colors_bg_type" ) => array( 'classic', 'gradient' ),
						),
					)
				);

				$this->add_control(
					$this->get_control_name_parameter( $key, "{$state_key}_colors_bg_stop" ),
					array(
						'label' => _x( 'Background Location', 'Background Control', 'faith-connect' ),
						'type' => Controls_Manager::SLIDER,
						'size_units' => array( '%' ),
						'default' => array(
							'unit' => '%',
							'size' => 0,
						),
						'render_type' => 'ui',
						'condition' => array(
							$this->get_control_id_parameter( $key, "{$state_key}_colors_bg_type" ) => 'gradient',
						),
					)
				);

				$this->add_control(
					$this->get_control_name_parameter( $key, "{$state_key}_colors_bg_b" ),
					array(
						'label' => _x( 'Second Background', 'Background Control', 'faith-connect' ),
						'type' => Controls_Manager::COLOR,
						'dynamic' => array(),
						'render_type' => 'ui',
						'condition' => array(
							$this->get_control_id_parameter( $key, "{$state_key}_colors_bg_type" ) => 'gradient',
						),
					)
				);

				$this->add_control(
					$this->get_control_name_parameter( $key, "{$state_key}_colors_bg_b_stop" ),
					array(
						'label' => _x( 'Second Background Location', 'Background Control', 'faith-connect' ),
						'type' => Controls_Manager::SLIDER,
						'size_units' => array( '%' ),
						'default' => array(
							'unit' => '%',
							'size' => 100,
						),
						'render_type' => 'ui',
						'condition' => array(
							$this->get_control_id_parameter( $key, "{$state_key}_colors_bg_type" ) => 'gradient',
						),
					)
				);

				$this->add_control(
					$this->get_control_name_parameter( $key, "{$state_key}_colors_bg_gradient_type" ),
					array(
						'label' => _x( 'Gradient Type', 'Background Control', 'faith-connect' ),
						'type' => Controls_Manager::SELECT,
						'options' => array(
							'linear' => _x( 'Linear', 'Background Control', 'faith-connect' ),
							'radial' => _x( 'Radial', 'Background Control', 'faith-connect' ),
						),
						'default' => 'linear',
						'render_type' => 'ui',
						'condition' => array(
							$this->get_control_id_parameter( $key, "{$state_key}_colors_bg_type" ) => 'gradient',
						),
					)
				);

				$this->add_control(
					$this->get_control_name_parameter( $key, "{$state_key}_colors_bg_gradient_angle" ),
					array(
						'label' => _x( 'Gradient Angle', 'Background Control', 'faith-connect' ),
						'type' => Controls_Manager::SLIDER,
						'size_units' => array( 'deg' ),
						'default' => array(
							'unit' => 'deg',
							'size' => 180,
						),
						'range' => array(
							'deg' => array(
								'step' => 10,
							),
						),
						'selectors' => array(
							':root' => '--' . $this->get_control_prefix_parameter( $key, "{$state_key}_colors_bg" ) . ': transparent;' .
								'--' . $this->get_control_prefix_parameter( $key, "{$state_key}_colors_bg_image" ) . ': linear-gradient({{SIZE}}{{UNIT}}, {{' . $this->get_control_id_parameter( $key, "{$state_key}_colors_bg" ) . '.VALUE}} {{' . $this->get_control_id_parameter( $key, "{$state_key}_colors_bg_stop" ) . '.SIZE}}{{' . $this->get_control_id_parameter( $key, "{$state_key}_colors_bg_stop" ) . '.UNIT}}, {{' . $this->get_control_id_parameter( $key, "{$state_key}_colors_bg_b" ) . '.VALUE}} {{' . $this->get_control_id_parameter( $key, "{$state_key}_colors_bg_b_stop" ) . '.SIZE}}{{' . $this->get_control_id_parameter( $key, "{$state_key}_colors_bg_b_stop" ) . '.UNIT}});',
						),
						'condition' => array(
							$this->get_control_id_parameter( $key, "{$state_key}_colors_bg_type" ) => 'gradient',
							$this->get_control_id_parameter( $key, "{$state_key}_colors_bg_gradient_type" ) => 'linear',
						),
					)
				);

				$this->add_control(
					$this->get_control_name_parameter( $key, "{$state_key}_colors_bg_gradient_position" ),
					array(
						'label' => _x( 'Gradient Position', 'Background Control', 'faith-connect' ),
						'type' => Controls_Manager::SELECT,
						'options' => array(
							'center center' => _x( 'Center Center', 'Background Control', 'faith-connect' ),
							'center left' => _x( 'Center Left', 'Background Control', 'faith-connect' ),
							'center right' => _x( 'Center Right', 'Background Control', 'faith-connect' ),
							'top center' => _x( 'Top Center', 'Background Control', 'faith-connect' ),
							'top left' => _x( 'Top Left', 'Background Control', 'faith-connect' ),
							'top right' => _x( 'Top Right', 'Background Control', 'faith-connect' ),
							'bottom center' => _x( 'Bottom Center', 'Background Control', 'faith-connect' ),
							'bottom left' => _x( 'Bottom Left', 'Background Control', 'faith-connect' ),
							'bottom right' => _x( 'Bottom Right', 'Background Control', 'faith-connect' ),
						),
						'default' => 'center center',
						'selectors' => array(
							':root' => '--' . $this->get_control_prefix_parameter( $key, "{$state_key}_colors_bg" ) . ': transparent;' .
								'--' . $this->get_control_prefix_parameter( $key, "{$state_key}_colors_bg_image" ) . ': radial-gradient(at {{VALUE}}, {{' . $this->get_control_id_parameter( $key, "{$state_key}_colors_bg" ) . '.VALUE}} {{' . $this->get_control_id_parameter( $key, "{$state_key}_colors_bg_stop" ) . '.SIZE}}{{' . $this->get_control_id_parameter( $key, "{$state_key}_colors_bg_stop" ) . '.UNIT}}, {{' . $this->get_control_id_parameter( $key, "{$state_key}_colors_bg_b" ) . '.VALUE}} {{' . $this->get_control_id_parameter( $key, "{$state_key}_colors_bg_b_stop" ) . '.SIZE}}{{' . $this->get_control_id_parameter( $key, "{$state_key}_colors_bg_b_stop" ) . '.UNIT}})',
						),
						'condition' => array(
							$this->get_control_id_parameter( $key, "{$state_key}_colors_bg_type" ) => 'gradient',
							$this->get_control_id_parameter( $key, "{$state_key}_colors_bg_gradient_type" ) => 'radial',
						),
					)
				);
			} elseif ( 'color' === $background ) {
				$this->add_control(
					$this->get_control_name_parameter( $key, "{$state_key}_colors_bg" ),
					array(
						'label' => esc_html__( 'Background', 'faith-connect' ),
						'type' => Controls_Manager::COLOR,
						'dynamic' => array(),
						'selectors' => array(
							':root' => '--' . $this->get_control_prefix_parameter( $key, "{$state_key}_colors_bg" ) . ': {{VALUE}};',
						),
					)
				);
			}

			if ( true === $color ) {
				$this->add_control(
					$this->get_control_name_parameter( $key, "{$state_key}_colors_color" ),
					array(
						'label' => esc_html__( 'Color', 'faith-connect' ),
						'type' => Controls_Manager::COLOR,
						'dynamic' => array(),
						'selectors' => array(
							':root' => '--' . $this->get_control_prefix_parameter( $key, "{$state_key}_colors_color" ) . ': {{VALUE}};',
						),
					)
				);
			}

			if ( true === $border ) {
				$this->add_control(
					$this->get_control_name_parameter( $key, "{$state_key}_colors_bd" ),
					array(
						'label' => esc_html__( 'Border', 'faith-connect' ),
						'type' => Controls_Manager::COLOR,
						'dynamic' => array(),
						'selectors' => array(
							':root' => '--' . $this->get_control_prefix_parameter( $key, "{$state_key}_colors_bd" ) . ': {{VALUE}};',
						),
						'condition' => array(
							$this->get_control_id_parameter( $key, "normal_border_border!" ) => 'none',
						),
					)
				);
			}

			if ( true === $bd_radius ) {
				$this->add_control(
					$this->get_control_name_parameter( $key, "{$state_key}_bd_radius" ),
					array(
						'label' => esc_html__( 'Border Radius', 'faith-connect' ),
						'type' => Controls_Manager::DIMENSIONS,
						'size_units' => array(
							'px',
							'%',
						),
						'selectors' => array(
							':root' => '--' . $this->get_control_prefix_parameter( $key, "{$state_key}_bd_radius" ) . ': {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
						),
					)
				);
			}

			if (
				is_array( $text_decoration_states ) &&
				! empty( $text_decoration_states ) &&
				in_array( $state_key, $text_decoration_states, true )
			) {
				$this->add_control(
					$this->get_control_name_parameter( $key, "{$state_key}_text_decoration" ),
					array(
						'label' => esc_html__( 'Text Decoration', 'faith-connect' ),
						'type' => Controls_Manager::SELECT,
						'options' => array(
							'' => esc_html__( 'Default', 'faith-connect' ),
							'none' => _x( 'None', 'Typography Control', 'faith-connect' ),
							'underline' => _x( 'Underline', 'Typography Control', 'faith-connect' ),
							'overline' => _x( 'Overline', 'Typography Control', 'faith-connect' ),
							'line-through' => _x( 'Line Through', 'Typography Control', 'faith-connect' ),
						),
						'selectors' => array(
							':root' => '--' . $this->get_control_prefix_parameter( $key, "{$state_key}_text_decoration" ) . ': {{VALUE}};',
						),
					)
				);
			}

			if ( true === $text_shadow ) {
				$text_shadow_state_key = ( 'normal' === $state_key ) ? '' : $state_key;

				$this->add_var_group_control(
					$this->get_control_name_parameter( $key, $text_shadow_state_key ),
					Settings_Tab_Base::VAR_TEXT_SHADOW
				);
			}

			if ( true === $box_shadow ) {
				$this->add_var_group_control(
					$this->get_control_name_parameter( $key, $state_key ),
					Settings_Tab_Base::VAR_BOX_SHADOW
				);
			}

			$this->end_controls_tab();
		}

		$this->end_controls_tabs();

		if ( true === $border ) {
			$this->add_var_group_control(
				$this->get_control_name_parameter( $key, 'normal' ),
				Settings_Tab_Base::VAR_BORDER,
				array(
					'fields_options' => array(
						'width' => array( 'label' => esc_html__( 'Border Width', 'faith-connect' ) ),
					),
					'exclude' => array( 'color' ),
					'separator' => 'before',
				)
			);
		}
	}

}
