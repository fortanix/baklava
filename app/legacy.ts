
import '../src/legacy/style/main.scss';


//
// Components
//

// Prefab components
export * as Prefab from '../src/legacy/prefab.ts';

// Note: do not include components from '../src/legacy/components/internal', since these are only meant to be used by Baklava
// components internally.

// Typography
export { H1, H2, H3, H4, H5, H6 } from '../src/legacy/components/typography/headings/Headings.tsx';
export { Caption } from '../src/legacy/components/typography/caption/Caption.tsx';
export { Entity } from '../src/legacy/components/typography/entity/Entity.tsx';
export { Code } from '../src/legacy/components/typography/code/Code.tsx';

// Icons
export { SpriteIcon } from '../src/legacy/components/icons/Icon.tsx';
export { IconDecorated } from '../src/legacy/components/icons/IconDecorated.tsx';
export { BaklavaIcon } from '../src/legacy/components/icons/icon-pack-baklava/BaklavaIcon.tsx';
export { BaklavaIconDecorated } from '../src/legacy/components/icons/icon-pack-baklava/BaklavaIconDecorated.tsx';

// Containers
export { Accordion } from '../src/legacy/components/containers/accordion/Accordion.tsx';
export { Panel } from '../src/legacy/components/containers/panel/Panel.tsx';
export { PropertyList } from '../src/legacy/components/containers/propertyList/PropertyList.tsx';
export { Tag } from '../src/legacy/components/containers/tag/Tag.tsx';

// Buttons
export { Button } from '../src/legacy/components/buttons/Button.tsx';

// Overlays
export { Loader } from '../src/legacy/components/overlays/loader/Loader.tsx';
export { Tooltip } from '../src/legacy/components/overlays/tooltip/Tooltip.tsx';
export { Modal } from '../src/legacy/components/overlays/modal/Modal.tsx';
export { Dropdown } from '../src/legacy/components/overlays/dropdown/Dropdown.tsx';
export * from '../src/legacy/components/overlays/notification/Notification.tsx';

// Forms
export { Label } from '../src/legacy/components/forms/Label/Label.tsx';
export { Checkbox } from '../src/legacy/components/forms/Checkbox/Checkbox.tsx';
export { Radio } from '../src/legacy/components/forms/Radio/Radio.tsx';
export { Input } from '../src/legacy/components/forms/Input/Input.tsx';
export { MaskedInput } from '../src/legacy/components/forms/MaskedInput/MaskedInput.tsx';
export { TextArea } from '../src/legacy/components/forms/TextArea/TextArea.tsx';
export { Select } from '../src/legacy/components/forms/Select/Select.tsx';
export { MultiSelect } from '../src/legacy/components/forms/Select/MultiSelect/MultiSelect.tsx';
export { LazySelect } from '../src/legacy/components/forms/Select/LazySelect/LazySelect.tsx';
export { DatePicker } from '../src/legacy/components/forms/DateTime/DatePicker.tsx';
export { DateTimePicker } from '../src/legacy/components/forms/DateTime/DateTimePicker.tsx';
export * as YearMonthPicker from '../src/legacy/components/forms/DateTime/YearMonthPicker.tsx';
export * as MultiAssigner from '../src/legacy/components/forms/MultiAssigner/assigner/MultiAssigner.tsx';
export * as MultiAssignerEager from '../src/legacy/components/forms/MultiAssigner/MultiAssignerEager.tsx';
export { ColorPicker } from '../src/legacy/components/forms/ColorPicker/ColorPicker.tsx';

/*
// Collection components
export { Pagination } from '../src/components/tables/DataTable/pagination/Pagination.tsx';

// Tables
export * as DataTableContext from '../src/components/tables/DataTable/DataTableContext.tsx';
export * as DataTable from '../src/components/tables/DataTable/table/DataTable.tsx';
export * as DataTablePlaceholder from '../src/components/tables/DataTable/table/DataTablePlaceholder.tsx';
export * as DataTableEager from '../src/components/tables/DataTable/DataTableEager.tsx';
export * as DataTableLazy from '../src/components/tables/DataTable/DataTableLazy.tsx';
export * as DataTableStream from '../src/components/tables/DataTable/DataTableStream.tsx';
export { useCustomFilters } from '../src/components/tables/DataTable/plugins/useCustomFilters.tsx';
export { useRowSelectColumn } from '../src/components/tables/DataTable/plugins/useRowSelectColumn.tsx';
export * as Filtering from '../src/components/tables/DataTable/filtering/Filtering.ts';
*/

// Collection components
export { Pagination } from '../src/legacy/components/tables/DataTable/pagination/Pagination.tsx';

// Tables
export * as DataTableContext from '../src/legacy/components/tables/DataTable/DataTableContext.tsx';
export * as DataTable from '../src/legacy/components/tables/DataTable/table/DataTable.tsx';
export * as DataTablePlaceholder from '../src/legacy/components/tables/DataTable/table/DataTablePlaceholder.tsx';
export * as DataTableEager from '../src/legacy/components/tables/DataTable/DataTableEager.tsx';
export * as DataTableLazy from '../src/legacy/components/tables/DataTable/DataTableLazy.tsx';
export * as DataTableStream from '../src/legacy/components/tables/DataTable/DataTableStream.tsx';
export { useCustomFilters } from '../src/legacy/components/tables/DataTable/plugins/useCustomFilters.tsx';
export { useRowSelectColumn } from '../src/legacy/components/tables/DataTable/plugins/useRowSelectColumn.tsx';
export * as Filtering from '../src/legacy/components/tables/DataTable/filtering/Filtering.ts';

// Layout
export { Layout } from '../src/legacy/components/layout/layouts/Layout.tsx';
export { HeaderGrid } from '../src/legacy/components/layout/headers/HeaderGrid.tsx';
export { Sidebar } from '../src/legacy/components/layout/sidebars/Sidebar.tsx';
export { Nav, NavItem } from '../src/legacy/components/layout/sidebars/Nav.tsx';
export { SidebarTooltip } from '../src/legacy/components/layout/sidebars/SidebarTooltip.tsx';
export { Breadcrumbs } from '../src/legacy/components/layout/breadcrumbs/Breadcrumbs.tsx';

// Navigation
export { SwitcherButtons } from '../src/legacy/components/navigation/Switcher/Switcher.tsx';
export { Tabs } from '../src/legacy/components/navigation/Tabs/Tabs.tsx';
export { TabsEmbedded } from '../src/legacy/components/navigation/TabsEmbedded/TabsEmbedded.tsx';

// Progress
export { ProgressBar } from '../src/legacy/components/progress/Progress.tsx';

// Util
export {
  handleTabKeyDown,
  handleRadioKeyDown,
  handleNavKeyDown,
  handleTriggerKeyDown,
  handleOptionKeyDown,
} from '../src/legacy/util/keyboardHandlers.tsx';
