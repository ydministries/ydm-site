<?php
namespace FaithConnectSpace\Kits\Settings\PagePreloader;

use FaithConnectSpace\Kits\Settings\Base\Settings_Tab_Base;

use Elementor\Controls_Manager;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}


/**
 * Page Preloader settings.
 */
class Page_Preloader extends Settings_Tab_Base {

	/**
	 * Get toggle name.
	 *
	 * Retrieve the toggle name.
	 *
	 * @return string Toggle name.
	 */
	public static function get_toggle_name() {
		return 'page_preloader';
	}

	/**
	 * Get title.
	 *
	 * Retrieve the toggle title.
	 */
	public function get_title() {
		return esc_html__( 'Page Preloader', 'faith-connect' );
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
			'visibility',
			array(
				'label' => esc_html__( 'Visibility', 'faith-connect' ),
				'description' => esc_html__( 'This setting will be applied after save and reload.', 'faith-connect' ),
				'type' => Controls_Manager::SWITCHER,
				'label_off' => esc_html__( 'Hide', 'faith-connect' ),
				'label_on' => esc_html__( 'Show', 'faith-connect' ),
				'default' => 'no',
			)
		);

		$this->add_control(
			'container_heading_control',
			array(
				'label' => __( 'Container', 'faith-connect' ),
				'type' => Controls_Manager::HEADING,
				'condition' => array(
					$this->get_control_id_parameter( '', 'visibility' ) => 'yes',
				),
			)
		);

		$this->add_var_group_control( '', self::VAR_BACKGROUND, array(
			'condition' => array(
				$this->get_control_id_parameter( '', 'visibility' ) => 'yes',
			),
		) );

		$this->add_responsive_control(
			'entrance_animation',
			array(
				'label' => esc_html__( 'Entrance Animation', 'faith-connect' ),
				'type' => Controls_Manager::SELECT,
				'label_block' => true,
				'options' => array(
					'fade-out' => esc_html__( 'Fade In', 'faith-connect' ),
					'fade-out-down' => esc_html__( 'Fade In Down', 'faith-connect' ),
					'fade-out-right' => esc_html__( 'Fade In Right', 'faith-connect' ),
					'fade-out-up' => esc_html__( 'Fade In Up', 'faith-connect' ),
					'fade-out-left' => esc_html__( 'Fade In Left', 'faith-connect' ),
					'zoom-out' => esc_html__( 'Zoom In', 'faith-connect' ),
					'slide-out-down' => esc_html__( 'Slide In Down', 'faith-connect' ),
					'slide-out-right' => esc_html__( 'Slide In Right', 'faith-connect' ),
					'slide-out-up' => esc_html__( 'Slide In Up', 'faith-connect' ),
					'slide-out-left' => esc_html__( 'Slide In Left', 'faith-connect' ),
				),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'entrance_animation' ) . ': cmsmasters-page-preloader-transition-{{VALUE}};',
				),
				'condition' => array(
					$this->get_control_id_parameter( '', 'visibility' ) => 'yes',
				),
			)
		);

		$this->add_responsive_control(
			'exit_animation',
			array(
				'label' => esc_html__( 'Exit Animation', 'faith-connect' ),
				'type' => Controls_Manager::SELECT,
				'label_block' => true,
				'options' => array(
					'fade-in' => esc_html__( 'Fade Out', 'faith-connect' ),
					'fade-in-down' => esc_html__( 'Fade Out Down', 'faith-connect' ),
					'fade-in-right' => esc_html__( 'Fade Out Right', 'faith-connect' ),
					'fade-in-up' => esc_html__( 'Fade Out Up', 'faith-connect' ),
					'fade-in-left' => esc_html__( 'Fade Out Left', 'faith-connect' ),
					'zoom-in' => esc_html__( 'Zoom Out', 'faith-connect' ),
					'slide-in-down' => esc_html__( 'Slide Out Down', 'faith-connect' ),
					'slide-in-right' => esc_html__( 'Slide Out Right', 'faith-connect' ),
					'slide-in-up' => esc_html__( 'Slide Out Up', 'faith-connect' ),
					'slide-in-left' => esc_html__( 'Slide Out Left', 'faith-connect' ),
				),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'exit_animation' ) . ': cmsmasters-page-preloader-transition-{{VALUE}};',
				),
				'condition' => array(
					$this->get_control_id_parameter( '', 'visibility' ) => 'yes',
				),
			)
		);

		$this->add_control(
			'animation_duration',
			array(
				'label' => esc_html__( 'Animation Duration', 'faith-connect' ) . ' (ms)',
				'type' => Controls_Manager::SLIDER,
				'range' => array(
					'px' => array(
						'min' => 0,
						'max' => 5000,
						'step' => 50,
					),
				),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'animation_duration' ) . ': {{SIZE}}ms;',
				),
				'condition' => array(
					$this->get_control_id_parameter( '', 'visibility' ) => 'yes',
				),
			)
		);

		$this->add_control(
			'preloader_divider_control',
			array(
				'type' => Controls_Manager::DIVIDER,
				'style' => 'thick',
				'condition' => array(
					$this->get_control_id_parameter( '', 'visibility' ) => 'yes',
				),
			)
		);

		$this->add_control(
			'preloader_heading_control',
			array(
				'label' => __( 'Preloader', 'faith-connect' ),
				'type' => Controls_Manager::HEADING,
				'condition' => array(
					$this->get_control_id_parameter( '', 'visibility' ) => 'yes',
				),
			)
		);

		$this->add_control(
			'preloader_type',
			array(
				'label' => esc_html__( 'Type', 'faith-connect' ),
				'description' => esc_html__( 'This setting will be applied after save and reload.', 'faith-connect' ),
				'type' => Controls_Manager::SELECT,
				'options' => array(
					'none' => esc_html__( 'None', 'faith-connect' ),
					'animation' => esc_html__( 'Animation', 'faith-connect' ),
					'icon' => esc_html__( 'Icon', 'faith-connect' ),
					'image' => esc_html__( 'Image', 'faith-connect' ),
				),
				'condition' => array(
					$this->get_control_id_parameter( '', 'visibility' ) => 'yes',
				),
			)
		);

		$this->add_control(
			'preloader_icon',
			array(
				'label' => esc_html__( 'Icon', 'faith-connect' ),
				'description' => esc_html__( 'This setting will be applied after save and reload.', 'faith-connect' ),
				'type' => Controls_Manager::ICONS,
				'default' => array(
					'value' => 'fas fa-spinner',
					'library' => 'fa-solid',
				),
				'condition' => array(
					$this->get_control_id_parameter( '', 'visibility' ) => 'yes',
					$this->get_control_id_parameter( '', 'preloader_type' ) => 'icon',
				),
			)
		);

		$this->add_control(
			'preloader_image',
			array(
				'label' => esc_html__( 'Image', 'faith-connect' ),
				'description' => esc_html__( 'This setting will be applied after save and reload.', 'faith-connect' ),
				'type' => Controls_Manager::MEDIA,
				'condition' => array(
					$this->get_control_id_parameter( '', 'visibility' ) => 'yes',
					$this->get_control_id_parameter( '', 'preloader_type' ) => 'image',
				),
			)
		);

		$this->add_control(
			'preloader_animation_type',
			array(
				'label' => esc_html__( 'Animation', 'faith-connect' ),
				'description' => esc_html__( 'This setting will be applied after save and reload.', 'faith-connect' ),
				'type' => Controls_Manager::SELECT,
				'options' => array(
					'circle' => esc_html__( 'Circle', 'faith-connect' ),
					'circle-dashed' => esc_html__( 'Circle Dashed', 'faith-connect' ),
					'bouncing-dots' => esc_html__( 'Bouncing Dots', 'faith-connect' ),
					'pulsing-dots' => esc_html__( 'Pulsing Dots', 'faith-connect' ),
					'pulse' => esc_html__( 'Pulse', 'faith-connect' ),
					'overlap' => esc_html__( 'Overlap', 'faith-connect' ),
					'spinners' => esc_html__( 'Spinners', 'faith-connect' ),
					'nested-spinners' => esc_html__( 'Nested Spinners', 'faith-connect' ),
					'opposing-nested-spinners' => esc_html__( 'Opposing Nested Spinners', 'faith-connect' ),
					'opposing-nested-rings' => esc_html__( 'Opposing Nested Rings', 'faith-connect' ),
					'progress-bar' => esc_html__( 'Progress Bar', 'faith-connect' ),
					'two-way-progress-bar' => esc_html__( 'Two Way Progress Bar', 'faith-connect' ),
					'repeating-bar' => esc_html__( 'Repeating Bar', 'faith-connect' ),
				),
				'condition' => array(
					$this->get_control_id_parameter( '', 'visibility' ) => 'yes',
					$this->get_control_id_parameter( '', 'preloader_type' ) => 'animation',
				),
			)
		);

		$this->add_control(
			'preloader_animation',
			array(
				'label' => esc_html__( 'Animation', 'faith-connect' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => array(
					'' => esc_html__( 'None', 'faith-connect' ),
					'eicon-spin' => esc_html__( 'Spinning', 'faith-connect' ),
					'bounce' => esc_html__( 'Bounce', 'faith-connect' ),
					'flash' => esc_html__( 'Flash', 'faith-connect' ),
					'pulse' => esc_html__( 'Pulse', 'faith-connect' ),
					'rubberBand' => esc_html__( 'Rubber Band', 'faith-connect' ),
					'shake' => esc_html__( 'Shake', 'faith-connect' ),
					'headShake' => esc_html__( 'Head Shake', 'faith-connect' ),
					'swing' => esc_html__( 'Swing', 'faith-connect' ),
					'tada' => esc_html__( 'Tada', 'faith-connect' ),
					'wobble' => esc_html__( 'Wobble', 'faith-connect' ),
					'jello' => esc_html__( 'Jello', 'faith-connect' ),
				),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'preloader_animation' ) . ': {{VALUE}};',
				),
				'condition' => array(
					$this->get_control_id_parameter( '', 'visibility' ) => 'yes',
					$this->get_control_id_parameter( '', 'preloader_type' ) => array( 'icon', 'image' ),
				),
			)
		);

		$this->add_control(
			'preloader_animation_duration',
			array(
				'label' => esc_html__( 'Animation Duration', 'faith-connect' ) . ' (ms)',
				'type' => Controls_Manager::SLIDER,
				'range' => array(
					'px' => array(
						'min' => 0,
						'max' => 5000,
						'step' => 50,
					),
				),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'preloader_animation_duration' ) . ': {{SIZE}}ms;',
				),
				'conditions' => array(
					'relation' => 'and',
					'terms' => array(
						array(
							'name' => $this->get_control_id_parameter( '', 'visibility' ),
							'operator' => '=',
							'value' => 'yes',
						),
						array(
							'relation' => 'or',
							'terms' => array(
								array(
									'name' => $this->get_control_id_parameter( '', 'preloader_type' ),
									'operator' => 'in',
									'value' => array(
										'image',
										'icon',
									),
								),
								array(
									'relation' => 'and',
									'terms' => array(
										array(
											'name' => $this->get_control_id_parameter( '', 'preloader_type' ),
											'operator' => '=',
											'value' => 'animation',
										),
										array(
											'name' => $this->get_control_id_parameter( '', 'preloader_animation_type' ),
											'operator' => 'in',
											'value' => array(
												'circle',
												'circle-dashed',
												'bouncing-dots',
												'pulsing-dots',
												'spinners',
												'nested-spinners',
												'opposing-nested-spinners',
												'opposing-nested-rings',
												'progress-bar',
												'two-way-progress-bar',
												'repeating-bar',
											),
										),
									),
								),
							),
						),
					),
				),
			)
		);

		$this->add_control(
			'preloader_color',
			array(
				'label' => esc_html__( 'Color', 'faith-connect' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'preloader_color' ) . ': {{VALUE}};',
				),
				'condition' => array(
					$this->get_control_id_parameter( '', 'visibility' ) => 'yes',
					$this->get_control_id_parameter( '', 'preloader_type' ) => array( 'icon', 'animation' ),
				),
			)
		);

		$this->add_responsive_control(
			'preloader_size',
			array(
				'label' => esc_html__( 'Size', 'faith-connect' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px' ),
				'range' => array(
					'px' => array(
						'min' => 0,
						'max' => 300,
						'step' => 1,
					),
				),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'preloader_size' ) . ': {{SIZE}}{{UNIT}};',
				),
				'condition' => array(
					$this->get_control_id_parameter( '', 'visibility' ) => 'yes',
					$this->get_control_id_parameter( '', 'preloader_type' ) => array( 'icon', 'animation' ),
				),
			)
		);

		$this->add_responsive_control(
			'preloader_rotate',
			array(
				'label' => esc_html__( 'Rotate', 'faith-connect' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'deg', 'grad', 'rad', 'turn' ),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'preloader_rotate' ) . ': {{SIZE}}{{UNIT}};',
				),
				'condition' => array(
					$this->get_control_id_parameter( '', 'visibility' ) => 'yes',
					$this->get_control_id_parameter( '', 'preloader_type' ) => 'icon',
					$this->get_control_id_parameter( '', 'preloader_animation' ) . '!' => array(
						'eicon-spin',
						'bounce',
						'pulse',
						'rubberBand',
						'shake',
						'headShake',
						'swing',
						'tada',
						'wobble',
						'jello',
					),
				),
			)
		);

		$this->add_responsive_control(
			'preloader_width',
			array(
				'label' => esc_html__( 'Width', 'faith-connect' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'range' => array(
					'%' => array(
						'min' => 1,
						'max' => 100,
					),
					'px' => array(
						'min' => 1,
						'max' => 1000,
					),
					'vw' => array(
						'min' => 1,
						'max' => 100,
					),
				),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'preloader_width' ) . ': {{SIZE}}{{UNIT}};',
				),
				'condition' => array(
					$this->get_control_id_parameter( '', 'visibility' ) => 'yes',
					$this->get_control_id_parameter( '', 'preloader_type' ) => 'image',
				),
			)
		);

		$this->add_responsive_control(
			'preloader_max_width',
			array(
				'label' => esc_html__( 'Max Width', 'faith-connect' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'range' => array(
					'%' => array(
						'min' => 1,
						'max' => 100,
					),
					'px' => array(
						'min' => 1,
						'max' => 1000,
					),
					'vw' => array(
						'min' => 1,
						'max' => 100,
					),
				),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'preloader_max_width' ) . ': {{SIZE}}{{UNIT}};',
				),
				'condition' => array(
					$this->get_control_id_parameter( '', 'visibility' ) => 'yes',
					$this->get_control_id_parameter( '', 'preloader_type' ) => 'image',
				),
			)
		);

		$this->add_responsive_control(
			'preloader_opacity',
			array(
				'label' => esc_html__( 'Opacity', 'faith-connect' ),
				'type' => Controls_Manager::SLIDER,
				'range' => array(
					'px' => array(
						'min' => 0,
						'max' => 1,
						'step' => .1,
					),
				),
				'selectors' => array(
					':root' => '--' . $this->get_control_prefix_parameter( '', 'preloader_opacity' ) . ': {{SIZE}};',
				),
				'condition' => array(
					$this->get_control_id_parameter( '', 'visibility' ) => 'yes',
					$this->get_control_id_parameter( '', 'preloader_type' ) => 'image',
				),
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
