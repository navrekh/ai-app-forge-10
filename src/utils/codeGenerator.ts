export const generateReactNativeCode = (project: any, editableComponents: any[]) => {
  const componentName = project.name.replace(/[^a-zA-Z0-9]/g, '');
  
  // Generate import statements
  const imports = `import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';`;

  // Generate component JSX
  const generateComponentJSX = (component: any, index: number) => {
    const fontSize = {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
    }[component.fontSize || 'base'];

    const textAlign = component.alignment || 'left';

    if (component.type === 'text') {
      return `      <Text style={[styles.text${index}, { color: '${component.color}', fontSize: ${fontSize}, textAlign: '${textAlign}' }]}>
        ${component.text}
      </Text>`;
    }

    if (component.type === 'image') {
      return `      <Image 
        source={{ uri: '${component.imageUrl}' }}
        style={styles.image${index}}
        resizeMode="cover"
      />`;
    }

    if (component.type === 'button') {
      return `      <TouchableOpacity 
        style={[styles.button${index}, { backgroundColor: '${component.bgColor}' }]}
        onPress={() => console.log('Button pressed')}
      >
        <Text style={[styles.buttonText${index}, { color: '${component.color}', fontSize: ${fontSize}, textAlign: '${textAlign}' }]}>
          ${component.text}
        </Text>
      </TouchableOpacity>`;
    }

    return '';
  };

  const componentsJSX = editableComponents
    .map((comp, idx) => generateComponentJSX(comp, idx))
    .join('\n\n');

  // Generate styles
  const generateComponentStyles = (component: any, index: number) => {
    if (component.type === 'text') {
      return `  text${index}: {
    marginVertical: 8,
    paddingHorizontal: 12,
  },`;
    }

    if (component.type === 'image') {
      return `  image${index}: {
    width: '100%',
    height: 192,
    marginVertical: 8,
    borderRadius: 8,
  },`;
    }

    if (component.type === 'button') {
      return `  button${index}: {
    marginVertical: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText${index}: {
    fontWeight: '600',
  },`;
    }

    return '';
  };

  const componentStyles = editableComponents
    .map((comp, idx) => generateComponentStyles(comp, idx))
    .join('\n  ');

  // Generate complete component
  const code = `${imports}

export default function ${componentName}Screen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>${project.name}</Text>
        
${componentsJSX}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  ${componentStyles}
});`;

  return code;
};
