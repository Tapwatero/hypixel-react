import properties from '../properties.json';

export function getProperty(propertyName: string) {

    // Dynamicly change properties
    if((window as any).dynamicProps && (window as any).dynamicProps[propertyName]){
        return (window as any).dynamicProps[propertyName];
    }

    return properties[propertyName];
}