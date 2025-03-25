import { SymbolView } from 'expo-symbols';
import React from 'react';

/**
 * A component that renders a SymbolView icon with customizable properties.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.name - The name of the symbol.
 * @param {number} [props.size=24] - The size of the symbol.
 * @param {string} props.color - The color of the symbol.
 * @param {Object} [props.style] - Additional styles for the symbol.
 * @param {string} [props.weight='regular'] - The weight of the symbol.
 * @returns {JSX.Element} The rendered SymbolView component.
 */
export function IconSymbol({ name, size = 24, color, style, weight = 'regular' }) {
  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={name}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
}

