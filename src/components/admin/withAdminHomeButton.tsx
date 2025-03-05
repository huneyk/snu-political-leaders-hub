import React, { useEffect, useRef } from 'react';
import AdminHomeButton from './AdminHomeButton';

// Higher-order component to add the AdminHomeButton to any admin page
const withAdminHomeButton = (WrappedComponent: React.ComponentType<any>) => {
  const WithAdminHomeButton = (props: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
      if (containerRef.current) {
        // Find the title element (h1 or h2) in the rendered component
        const titleElement = containerRef.current.querySelector('h1, h2');
        
        if (titleElement) {
          // Create a container for the button
          const buttonContainer = document.createElement('div');
          buttonContainer.className = 'admin-home-button-container mb-6';
          
          // Insert the button container after the title
          titleElement.parentNode?.insertBefore(buttonContainer, titleElement.nextSibling);
          
          // Render the AdminHomeButton into the container
          const root = document.createElement('div');
          buttonContainer.appendChild(root);
          
          // Create a temporary div to hold the button
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = `<button class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <span>관리자 홈으로 돌아가기</span>
          </button>`;
          
          // Add click event to navigate to admin home
          const button = tempDiv.querySelector('button');
          if (button) {
            button.addEventListener('click', () => {
              window.location.href = '/admin';
            });
            buttonContainer.appendChild(button);
          }
        }
      }
    }, []);
    
    return (
      <div ref={containerRef}>
        <WrappedComponent {...props} />
      </div>
    );
  };
  
  // Set display name for debugging purposes
  const wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithAdminHomeButton.displayName = `withAdminHomeButton(${wrappedComponentName})`;
  
  return WithAdminHomeButton;
};

export default withAdminHomeButton; 