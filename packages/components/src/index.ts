// Registry
export { ComponentRegistry } from './registry/ComponentRegistry';
export type {
  ComponentDefinition,
  ComponentCategory,
  PropDefinition,
  PropType,
  SlotDefinition,
  VariantDefinition,
  PlatformSupport,
  AccessibilitySpec,
} from './registry/ComponentDefinition';

// Definitions
export { ButtonDefinition } from './definitions/input/Button.def';
export { TextInputDefinition } from './definitions/input/TextInput.def';
export { CardDefinition } from './definitions/display/Card.def';
export { TextDefinition } from './definitions/display/Text.def';
export { HeadingDefinition } from './definitions/display/Heading.def';
export { ImageDefinition } from './definitions/display/Image.def';
export { ContainerDefinition } from './definitions/layout/Container.def';
export { NavbarDefinition } from './definitions/navigation/Navbar.def';
export { AlertDefinition } from './definitions/feedback/Alert.def';

// Auto-register all built-in components
import { ComponentRegistry } from './registry/ComponentRegistry';
import { ButtonDefinition } from './definitions/input/Button.def';
import { TextInputDefinition } from './definitions/input/TextInput.def';
import { CardDefinition } from './definitions/display/Card.def';
import { TextDefinition } from './definitions/display/Text.def';
import { HeadingDefinition } from './definitions/display/Heading.def';
import { ImageDefinition } from './definitions/display/Image.def';
import { ContainerDefinition } from './definitions/layout/Container.def';
import { NavbarDefinition } from './definitions/navigation/Navbar.def';
import { AlertDefinition } from './definitions/feedback/Alert.def';

const builtInComponents = [
  ButtonDefinition,
  TextInputDefinition,
  CardDefinition,
  TextDefinition,
  HeadingDefinition,
  ImageDefinition,
  ContainerDefinition,
  NavbarDefinition,
  AlertDefinition,
];

for (const def of builtInComponents) {
  ComponentRegistry.register(def);
}
