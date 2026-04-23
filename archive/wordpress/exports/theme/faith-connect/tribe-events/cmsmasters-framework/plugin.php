<?php
namespace FaithConnectSpace\TribeEvents\CmsmastersFramework;

use FaithConnectSpace\Core\Utils\File_Manager;
use FaithConnectSpace\Core\Utils\Utils;
use FaithConnectSpace\TemplateFunctions\Main_Elements;
use FaithConnectSpace\ThemeConfig\Theme_Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Plugin handler class is responsible for tribe events different methods.
 */
class Plugin {

	private $css_path_prefix = 'tribe-events/cmsmasters-framework/';

	protected $tribe_customizer = array();

	/**
	 * Plugin constructor.
	 */
	public function __construct() {
		if ( ! class_exists( 'Tribe__Events__Main' ) ) {
			return;
		}

		add_filter( 'cmsmasters_stylesheet_templates_paths_filter', array( $this, 'stylesheet_templates_paths_filter' ) );

		$this->tribe_customizer = get_option( 'tribe_customizer' );

		add_action( 'tribe_events_views_v2_bootstrap_pre_get_view_html', array( $this, 'wrapper_start' ) );
		add_action( 'get_footer', array( $this, 'wrapper_end' ) );

		add_filter( 'tribe_compatibility_container_classes', array( $this, 'add_widget_class' ) );

		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_styles' ), 1 );

		if ( 'done' === get_option( 'cmsmasters_faith-connect_elementor_kit_import' ) ) {
			add_action( 'admin_init', array( $this, 'update_options' ) );
		}
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
			$path . 'tribe-events.css',
			$path . 'tribe-events.min.css',
			$path . 'tribe-events-rtl.css',
			$path . 'tribe-events-rtl.min.css',
		) );
	}

	/**
	 * Events Archive, Venue and Organizer Layout.
	 *
	 * @return string layout.
	 */
	public function layout() {
		$cmsmasters_layout = '';

		if (
			tribe_is_list_view() ||
			tribe_is_month() ||
			tribe_is_day() ||
			( function_exists( 'tribe_is_past' ) && tribe_is_past() ) ||
			( function_exists( 'tribe_is_upcoming' ) && tribe_is_upcoming() ) ||
			( function_exists( 'tribe_is_week' ) && tribe_is_week() ) ||
			( function_exists( 'tribe_is_map' ) && tribe_is_map() ) ||
			( function_exists( 'tribe_is_photo' ) && tribe_is_photo() )
		) {
			$cmsmasters_layout = 'fullwidth';
		} else {
			$cmsmasters_layout = 'r-sidebar';
		}

		return $cmsmasters_layout;
	}

	/**
	 * Wrapper start HTML.
	 */
	public function wrapper_start() {
		echo Main_Elements::main_wrapper_start();
	}

	/**
	 * Wrapper end HTML.
	 */
	public function wrapper_end() {
		echo Main_Elements::main_wrapper_end();
	}

	public function add_widget_class() {
		$classes = array( 'widget tribe-compatibility-container' );

		return $classes;
	}

	/**
	 * Enqueue theme compatibility styles.
	 *
	 * @param array $styles Array of registered styles.
	 *
	 * @return array
	 */
	public function enqueue_styles() {
		$styles = array(
			// Free version
			'tribe-events-views-v2-full',
			'tribe-common-skeleton-style',
			'tribe-common-full-style',
			'tribe-events-views-v2-bootstrap-datepicker-styles',
			'tribe-events-v2-single-skeleton',
			'tribe-events-v2-single-skeleton-full',
			'tribe-events-v2-single-blocks',
			'tribe-events-calendar-pro-style',
			'tribe-events-full-pro-calendar-style',
			'widget-calendar-pro-style',
			'tribe-events-pro-views-v2-full',
			'tribe-events-calendar-style',
			'tribe-events-full-calendar-style',
			'tribe-events-pro-views-v2-override-style',
		);

		wp_deregister_style( $styles );

		wp_enqueue_style(
			'tribe_events_stylesheet_url',
			File_Manager::get_css_template_assets_url( 'tribe-events', null, 'default', true, $this->css_path_prefix ),
			array(),
			'1.0.0'
		);

		wp_add_inline_style(
			'tribe_events_stylesheet_url',
			$this->set_customizer_vars()
		);
	}

	/**
	 * Utility function for when we need a color in RGB format,
	 * since the Customizer always works with hex. Keepin' it DRY.
	 *
	 * @return string $rgb_color The hex color expressed as an rgb string, like '255,255,255'
	 */
	public function hex2rgb( $color ) {
		$new_color = substr( $color, 1 );
		$color_len = strlen( $new_color );
		$result = '';

		if ( 6 === $color_len ) {
			$rgb = str_split( $new_color, 2 );
		} elseif ( 3 === $color_len ) {
			$rgb = str_split( $new_color, 1 );
		}

		foreach ( $rgb as $number ) {
			$result .= hexdec( ( 2 === strlen( $number ) ) ? $number : $number . $number ) . ', ';
		}

		$rgb_color = substr( $result, 0, -2 );

		return $rgb_color;
	}

	/**
	 * Set value vars.
	 */
	public function get_customizer_vars( $parent, $option, $var_name, $static_value ) {
		$var_value = '';
		$new_styles = '';

		if (
			isset( $this->tribe_customizer[ $parent ][ $option ] ) &&
			! empty( $this->tribe_customizer[ $parent ][ $option ] )
		) {
			if ( false !== $static_value ) {
				$var_value = $static_value;
			} else {
				$var_value = $this->tribe_customizer[ $parent ][ $option ];
			}

			if ( ! empty( $var_value ) ) {
				$new_styles = $var_name . ': ' . $var_value . ';';
			}

			if ( ! empty( $new_styles ) ) {
				return $new_styles;
			}
		}
	}

	/**
	 * Enqueue frontend assets.
	 */
	public function set_customizer_vars() {
		$new_styles = array();

		$new_styles[] = $this->get_customizer_vars( 'global_elements', 'accent_color', '--tec-featured-color-scheme-custom', false );
		$new_styles[] = $this->get_customizer_vars( 'tec_events_bar', 'events_bar_text_color', '--tec-color-text-events-bar-input', false );
		$new_styles[] = $this->get_customizer_vars( 'tec_events_bar', 'events_bar_text_color', '--tec-color-text-events-bar-input-placeholder', false );
		$new_styles[] = $this->get_customizer_vars( 'tec_events_bar', 'events_bar_text_color', '--tec-opacity-events-bar-input-placeholder', '0.6' );
		$new_styles[] = $this->get_customizer_vars( 'tec_events_bar', 'events_bar_text_color', '--tec-color-text-view-selector-list-item', false );

		$new_styles[] = $this->get_customizer_vars( 'tec_events_bar', 'find_events_button_text_color', '--tec-color-text-events-bar-submit-button', false );

		if ( isset( $this->tribe_customizer['tec_events_bar']['events_bar_icon_color_choice'] ) ) {
			if ( 'custom' === $this->tribe_customizer['tec_events_bar']['events_bar_icon_color_choice'] ) {
				$new_styles[] = $this->get_customizer_vars( 'tec_events_bar', 'events_bar_icon_color', '--tec-color-icon-events-bar', false );
				$new_styles[] = $this->get_customizer_vars( 'tec_events_bar', 'events_bar_icon_color', '--tec-color-icon-events-bar-hover', false );
				$new_styles[] = $this->get_customizer_vars( 'tec_events_bar', 'events_bar_icon_color', '--tec-color-icon-events-bar-active', false );
			} elseif ( 'accent' === $this->tribe_customizer['tec_events_bar']['events_bar_icon_color_choice'] ) {
				$new_styles[] = $this->get_customizer_vars( 'global_elements', 'accent_color', '--tec-color-icon-events-bar', false );
				$new_styles[] = $this->get_customizer_vars( 'global_elements', 'accent_color', '--tec-color-icon-events-bar-hover', false );
				$new_styles[] = $this->get_customizer_vars( 'global_elements', 'accent_color', '--tec-color-icon-events-bar-active', false );
			}
		}

		if ( isset( $this->tribe_customizer['tec_events_bar']['find_events_button_color_choice'] ) ) {
			$find_events_button_color_choice = $this->tribe_customizer['tec_events_bar']['find_events_button_color_choice'];

			if ( 'custom' === $find_events_button_color_choice ) {
				$new_styles[] = $this->get_customizer_vars( 'tec_events_bar', 'find_events_button_color', '--tec-color-background-events-bar-submit-button', false );
			} elseif ( 'default' === $find_events_button_color_choice ) {
				$new_styles[] = $this->get_customizer_vars( 'global_elements', 'accent_color', '--tec-color-background-events-bar-submit-button', false );
			}
		} else {
			$new_styles[] = $this->get_customizer_vars( 'global_elements', 'button_color', '--tec-color-background-events-bar-submit-button', false );
		}

		if ( isset( $this->tribe_customizer['tec_events_bar']['events_bar_background_color_choice'] ) ) {
			$events_bar_background_color_choice = $this->tribe_customizer['tec_events_bar']['events_bar_background_color_choice'];

			if ( 'custom' === $events_bar_background_color_choice ) {
				$new_styles[] = $this->get_customizer_vars( 'tec_events_bar', 'events_bar_background_color', '--tec-color-background-events-bar', false );
				$new_styles[] = $this->get_customizer_vars( 'tec_events_bar', 'events_bar_background_color', '--tec-color-background-events-bar-tabs', false );
			} elseif ( 'global_background' === $events_bar_background_color_choice ) {
				$new_styles[] = $this->get_customizer_vars( 'global_elements', 'background_color', '--tec-color-background-events-bar', false );
				$new_styles[] = $this->get_customizer_vars( 'global_elements', 'background_color', '--tec-color-background-events-bar-tabs', false );
			}
		}

		if (
			isset( $this->tribe_customizer['tec_events_bar']['events_bar_border_color_choice'] ) &&
			'custom' === $this->tribe_customizer['tec_events_bar']['events_bar_border_color_choice']
		) {
			$new_styles[] = $this->get_customizer_vars( 'tec_events_bar', 'events_bar_border_color', '--tec-color-border-events-bar', false );
		}

		if ( isset( $this->tribe_customizer['global_elements']['font_size_base'] ) ) {
			$font_size_base = $this->tribe_customizer['global_elements']['font_size_base'];
			$sizes = array( 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 42 );
			$min_font_size = 8;
			$max_font_size = 72;
			$size_multiplier = 1;
			$size_multiplier = round( (int) $font_size_base / 16, 3 );

			foreach ( $sizes as $key => $size ) {
				$font_size = $size_multiplier * (int) $size;
				// round to whole pixels.
				$font_size = round( $font_size );
				// Minimum font size, for sanity.
				$font_size = max( $font_size, $min_font_size );
				// Maximum font size, for sanity.
				$font_size = min( $font_size, $max_font_size );

				$new_styles[] = "--tec-font-size-{$key}: {$font_size}px;";
			}

			if ( ! empty( $font_size_base ) ) {
				$new_styles[] = "--tec-font-size: {$font_size_base}px;";
			} else {
				$default_font_size = Theme_Config::TEXT_TYPOGRAPHY_DEFAULT_FONT_SIZE;
				$new_styles[] = '--tec-font-size: ' . $default_font_size['size'] . $default_font_size['unit'] . ';';
			}
		}

		$new_styles[] = $this->get_customizer_vars( 'global_elements', 'event_title_color', '--tec-color-text-events-title', false );
		$new_styles[] = $this->get_customizer_vars( 'global_elements', 'event_title_color', '--tec-color-text-event-title', false );

		$new_styles[] = $this->get_customizer_vars( 'global_elements', 'event_date_time_color', '--tec-color-text-event-date', false );
		$new_styles[] = $this->get_customizer_vars( 'global_elements', 'event_date_time_color', '--tec-color-text-event-date-secondary', false );

		// Link color overrides.
		$new_styles[] = $this->get_customizer_vars( 'global_elements', 'link_color', '--tec-color-link-primary', false );
		$new_styles[] = $this->get_customizer_vars( 'global_elements', 'link_color', '--tec-color-link-accent', false );

		if ( isset( $this->tribe_customizer['global_elements']['link_color'] ) ) {
			$new_styles[] = $this->get_customizer_vars( 'global_elements', 'accent_color', '--tec-color-link-primary', false );
			$new_styles[] = $this->get_customizer_vars( 'global_elements', 'accent_color', '--tec-color-link-accent', false );
		}

		// Background color overrides.
		if (
			isset( $this->tribe_customizer['global_elements']['background_color_choice'] ) &&
			'transparent' !== $this->tribe_customizer['global_elements']['background_color_choice']
		) {
			$new_styles[] = $this->get_customizer_vars( 'global_elements', 'background_color', '--tec-color-background-events', false );
		}

		$new_styles[] = $this->get_customizer_vars( 'global_elements', 'accent_color', '--tec-color-accent-primary', false );
		$new_styles[] = $this->get_customizer_vars( 'global_elements', 'accent_color', '--tec-color-text-view-selector-list-item-hover', false );
		$new_styles[] = $this->get_customizer_vars( 'global_elements', 'accent_color', '--tec-color-accent-primary-background-datepicker', false );
		$new_styles[] = $this->get_customizer_vars( 'global_elements', 'accent_color', '--tec-color-button-primary', false );
		$new_styles[] = $this->get_customizer_vars( 'global_elements', 'accent_color', '--tec-color-day-marker-current-month', false );

		// Accent color overrides.
		if (
			isset( $this->tribe_customizer['global_elements']['accent_color'] ) &&
			! empty( $this->tribe_customizer['global_elements']['accent_color'] )
		) {
			$accent_color_rgb = $this->hex2rgb( $this->tribe_customizer['global_elements']['accent_color'] );

			$new_styles[] = "--tec-color-accent-primary-multiday: rgba({$accent_color_rgb},0.24);";
			$new_styles[] = "--tec-color-accent-primary-multiday-hover: rgba({$accent_color_rgb},0.34);";
			$new_styles[] = "--tec-color-accent-primary-background: rgba({$accent_color_rgb},0.1);";
			$new_styles[] = "--tec-color-background-secondary-datepicker: rgba({$accent_color_rgb},0.5);";
			$new_styles[] = "--tec-color-button-primary-background: rgba({$accent_color_rgb},0.07);";
			$new_styles[] = "--tec-color-day-marker-current-month-hover: rgba({$accent_color_rgb},0.8);";
			$new_styles[] = "--tec-color-day-marker-current-month-active: rgba({$accent_color_rgb},0.9);";

			if (
				! isset( $this->tribe_customizer['month_view']['multiday_event_bar_color_choice'] ) ||
				(
					isset( $this->tribe_customizer['month_view']['multiday_event_bar_color_choice'] ) &&
					'default' === $this->tribe_customizer['month_view']['multiday_event_bar_color_choice']
				)
			) {
				$new_styles[] = "--tec-color-background-primary-multiday: rgba({$accent_color_rgb}, 0.24);";
				$new_styles[] = "--tec-color-background-primary-multiday-hover: rgba({$accent_color_rgb}, 0.34);";
				$new_styles[] = "--tec-color-background-primary-multiday-active: rgba({$accent_color_rgb}, 0.34);";
				$new_styles[] = "--tec-color-background-secondary-multiday: rgba({$accent_color_rgb}, 0.24);";
				$new_styles[] = "--tec-color-background-secondary-multiday-hover: rgba({$accent_color_rgb}, 0.34);";
			}
		}

		$new_styles[] = $this->get_customizer_vars( 'global_elements', 'filterbar_color', '--tec-filterbar-bg-color', false );

		$new_styles[] = $this->get_customizer_vars( 'month_week_view', 'table_bg_color', '--tec-table-bg-color', false );

		$new_styles[] = $this->get_customizer_vars( 'month_week_view', 'highlight_color', '--tec-highlight-color', false );

		$new_styles[] = $this->get_customizer_vars( 'month_view', 'grid_lines_color', '--tec-color-border-secondary-month-grid', false );

		$new_styles[] = $this->get_customizer_vars( 'month_view', 'grid_hover_color', '--tec-color-border-active-month-grid-hover', false );

		if (
			isset( $this->tribe_customizer['month_view']['grid_background_color_choice'] ) &&
			'transparent' !== $this->tribe_customizer['month_view']['grid_background_color_choice']
		) {
			$new_styles[] = $this->get_customizer_vars( 'month_view', 'grid_background_color', '--tec-color-background-month-grid', false );
		} elseif (
			isset( $this->tribe_customizer['month_view']['tooltip_background_color'] ) &&
			'default' !== $this->tribe_customizer['month_view']['tooltip_background_color'] &&
			isset( $this->tribe_customizer['global_elements']['background_color_choice'] ) &&
			'transparent' !== $this->tribe_customizer['global_elements']['background_color_choice']
		) {
			$new_styles[] = $this->get_customizer_vars( 'global_elements', 'background_color', '--tec-color-background-tooltip', false );
		}

		$new_styles[] = $this->get_customizer_vars( 'month_view', 'days_of_week_color', '--tec-color-text-day-of-week-month', false );

		$new_styles[] = $this->get_customizer_vars( 'month_view', 'date_marker_color', '--tec-color-day-marker-month', false );
		$new_styles[] = $this->get_customizer_vars( 'month_view', 'date_marker_color', '--tec-color-day-marker-past-month', false );

		if (
			isset( $this->tribe_customizer['month_view']['multiday_event_bar_color_choice'] ) &&
			'default' !== $this->tribe_customizer['month_view']['multiday_event_bar_color_choice'] &&
			isset( $this->tribe_customizer['month_view']['multiday_event_bar_color'] ) &&
			! empty( $this->tribe_customizer['month_view']['multiday_event_bar_color'] )
		) {
			$bar_color_rgb = $this->hex2rgb( $this->tribe_customizer['month_view']['multiday_event_bar_color'] );

			$new_styles[] = "--tec-color-background-primary-multiday: rgba({$bar_color_rgb}, 0.24);";
			$new_styles[] = "--tec-color-background-primary-multiday-hover: rgba({$bar_color_rgb}, 0.34);";
			$new_styles[] = "--tec-color-background-primary-multiday-active: rgba({$bar_color_rgb}, 0.34);";
			$new_styles[] = "--tec-color-background-secondary-multiday: rgba({$bar_color_rgb}, 0.24);";
			$new_styles[] = "--tec-color-background-secondary-multiday-hover: rgba({$bar_color_rgb}, 0.34);";
		}

		if (
			isset( $this->tribe_customizer['single_event']['post_title_color_choice'] ) &&
			'custom' === $this->tribe_customizer['single_event']['post_title_color_choice']
		) {
			$new_styles[] = $this->get_customizer_vars( 'single_event', 'post_title_color', '--tec-color-text-event-title', false );
		}

		$new_styles[] = $this->get_customizer_vars( 'day_list_view', 'price_bg_color', '--tec-price-bg-color', false );

		$new_styles[] = $this->get_customizer_vars( 'photo_view', 'bg_color', '--tec-photo-bg-color', false );

		$new_styles[] = $this->get_customizer_vars( 'widget', 'calendar_header_color', '--tec-calendar-header-color', false );

		$new_styles[] = $this->get_customizer_vars( 'widget', 'calendar_datebar_color', '--tec-calendar-datebar-color', false );

		// PRO
		$enabled_views = tribe_get_option( 'tribeEnableViews', array() );

		// View Selector Drop-down background color.
		if ( 3 < count( $enabled_views ) ) {
			if (
				isset( $this->tribe_customizer['tec_events_bar']['view_selector_background_color_choice'] ) &&
				'custom' === $this->tribe_customizer['tec_events_bar']['view_selector_background_color_choice']
			) {
				$new_styles[] = $this->get_customizer_vars( 'tec_events_bar', 'view_selector_background_color', '--tec-color-background-view-selector', false );
			} elseif (
				isset( $this->tribe_customizer['tec_events_bar']['events_bar_background_color_choice'] ) &&
				'custom' === $this->tribe_customizer['tec_events_bar']['events_bar_background_color_choice']
			) {
				$new_styles[] = $this->get_customizer_vars( 'tec_events_bar', 'events_bar_background_color', '--tec-color-background-view-selector', false );
				$new_styles[] = $this->get_customizer_vars( 'global_elements', 'background_color', '--tec-color-background-view-selector', false );
			}
		}

		$new_css = sprintf(
			':root {
				/* Customizer-added Events Bar styles */
				%1$s
			}',
			implode( "\n", $new_styles )
		);

		return $new_css;
	}

	/**
	 * Get the theme color and change the color to hex.
	 *
	 * @return string Get theme color.
	 */
	public function rgba_to_hex( $color, $alternate_color = '' ) {
		$kit_options = Utils::get_kit_options();
		$alternate_color = ( isset( $alternate_color ) && ! empty( $alternate_color ) ? $alternate_color : Theme_Config::PRIMARY_COLOR_DEFAULT );

		$filtered = array_filter( $kit_options['system_colors'], function( $item ) use ( $color ) {
			return isset( $item['_id'] ) && $item['_id'] === $color;
		} );

		if ( ! empty( $filtered ) ) {
			// If it is a system color
			$first_match = reset( $filtered );

			$color = $first_match[ 'color' ];
		} elseif ( isset( $kit_options['__globals__'][ $color ] ) && '' !== ( $kit_options['__globals__'][ $color ] ) ) {
			// If it is a general theme elements color
			$color = $kit_options['__globals__'][ $color ];
		} else {
			// If it is not a elements or system color
			if ( isset( $kit_options[ $color ] ) && '' !== ( $kit_options[ $color ] ) ) {
				$color = $kit_options[ $color ];
			} else {
				$color = $alternate_color;
			}
		}

		// Change to hex color
		$new_colors = '';

		if ( 0 === strpos( $color, '#' ) ) {
			if ( 7 < strlen( $color ) ) {
				return mb_substr( $color, 0, 7 );
			}

			return $color;
		} elseif ( 0 === strpos( $color, 'globals' ) ) {
			$new_colors = explode( "id=", $color )[ 1 ];

			foreach ( $kit_options['system_colors'] as $system_color ) {
				if ( $new_colors === $system_color['_id'] ) {
					$new_colors =  $system_color['color'];
				}
			}

			foreach ( $kit_options['custom_colors'] as $custom_colors ) {
				if ( $new_colors === $custom_colors['_id'] ) {
					$new_colors =  $custom_colors['color'];
				}
			}

			if ( 7 < strlen( $new_colors ) ) {
				return mb_substr( $new_colors, 0, 7 );
			}

			return $new_colors;
		} else {
			preg_match( '/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i', $color, $new_color );

			return sprintf( '#%02x%02x%02x', $new_color[1], $new_color[2], $new_color[3] );
		}
	}

	/**
	 * Updating default options in new design The Events Calendar plugin.
	 *
	 * @return string Hex color.
	 */
	public function update_options() {
		if ( 'update' === get_option( 'cmsmasters_faith-connect_tribe_events_update_option' ) ) {
			return;
		}

		set_transient( 'cmsmasters_tribe_events_backup_options', $this->tribe_customizer, 4 * WEEK_IN_SECONDS );

		$option = array();

		$default_font_size = Theme_Config::TEXT_TYPOGRAPHY_DEFAULT_FONT_SIZE;

		// Global Elements
		$option['global_elements'] = array(
			'font_family' => 'theme',
			'font_size_base' => $default_font_size['size'] . $default_font_size['unit'],
			'font_size' => '1',
			'event_title_color' => $this->rgba_to_hex( 'secondary' ),
			'event_date_time_color' => $this->rgba_to_hex( 'text' ),
			'link_color' => $this->rgba_to_hex( 'primary' ),
			'background_color_choice' => 'transparent',
			'background_color' => $this->rgba_to_hex( 'background' ),
			'accent_color' => $this->rgba_to_hex( 'accent' ),
			'map_pin' => '',
		);

		// Events Bar
		$option['tec_events_bar'] = array(
			'events_bar_text_color' => $this->rgba_to_hex( 'text' ),
			'find_events_button_text_color' => $this->rgba_to_hex( 'cmsmasters_button_normal_colors_color', Theme_Config::BACKGROUND_COLOR_DEFAULT ),
			'events_bar_icon_color_choice' => 'default',
			'events_bar_icon_color' => $this->rgba_to_hex( 'secondary' ),
			'find_events_button_color_choice' => 'custom',
			'find_events_button_color' => $this->rgba_to_hex( 'cmsmasters_button_normal_colors_bg', Theme_Config::PRIMARY_COLOR_DEFAULT ),
			'events_bar_background_color_choice' => 'default',
			'events_bar_background_color' => $this->rgba_to_hex( 'background' ),
			'view_selector_background_color_choice' => 'default',
			'view_selector_background_color' => $this->rgba_to_hex( 'background' ),
			'events_bar_border_color_choice' => 'default',
			'events_bar_border_color' => $this->rgba_to_hex( 'border' ),
		);

		// Month
		$option['month_view'] = array(
			'days_of_week_color' => $this->rgba_to_hex( 'secondary' ),
			'date_marker_color' => $this->rgba_to_hex( 'secondary' ),
			'multiday_event_bar_color_choice' => 'default',
			'multiday_event_bar_color' => $this->rgba_to_hex( 'accent' ),
			'grid_lines_color' => $this->rgba_to_hex( 'border' ),
			'grid_hover_color' => $this->rgba_to_hex( 'border' ),
			'grid_background_color_choice' => 'transparent',
			'grid_background_color' => $this->rgba_to_hex( 'background' ),
			'tooltip_background_color' => 'default',
		);

		// Single Event
		$option['single_event'] = array(
			'post_title_color_choice' => 'default',
			'post_title_color' => $this->rgba_to_hex( 'secondary' ),
		);

		update_option( 'tribe_customizer', $option );

		update_option( 'cmsmasters_faith-connect_tribe_events_update_option', 'update', '', 'yes' );
	}

}
