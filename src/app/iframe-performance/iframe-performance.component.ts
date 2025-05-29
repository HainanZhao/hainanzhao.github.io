import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { SearchService } from '../shared/services/search.service';

interface PerformanceTest {
  name: string;
  description: string;
  code: string;
  duration: number;
}

interface TestResult {
  testName: string;
  mainThreadBlocked: boolean;
  executionTime: number;
  frameDrops: number;
  description: string;
}

@Component({
  selector: 'app-iframe-performance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './iframe-performance.component.html',
  styleUrls: ['./iframe-performance.component.css']
})
export class IframePerformanceComponent implements OnInit, OnDestroy {
  @ViewChild('testIframe', { static: false }) testIframe!: ElementRef<HTMLIFrameElement>;
  
  private destroy$ = new Subject<void>();
  highlightedSection = '';

  // Test state
  isRunning = false;
  currentTest: PerformanceTest | null = null;
  testResults: TestResult[] = [];
  mainThreadFPS = 0;
  iframeFPS = 0;
  
  // Enhanced monitoring
  public mainThreadFrameId = 0;
  public lastMainThreadTime = 0;
  public mainThreadFrameCount = 0;
  public baselineFPS = 60;
  public fpsHistory: number[] = [];
  public isMainThreadStressed = false;
  public iframeActive = false;
  
  // Iframe monitoring
  public iframeFrameId = 0;
  public lastIframeTime = 0;
  public iframeFrameCount = 0;

  // Predefined performance tests
  performanceTests: PerformanceTest[] = [
    {
      name: 'Heavy CPU Loop',
      description: 'Runs a CPU-intensive loop to test thread blocking',
      duration: 3000,
      code: `
        const startTime = Date.now();
        const duration = 3000; // 3 seconds
        
        function heavyTask() {
          let result = 0;
          // More intensive calculation to stress the main thread
          for (let i = 0; i < 5000000; i++) {
            result += Math.random() * Math.sin(i) * Math.cos(i) * Math.tan(i);
            // Add some array operations to increase CPU load
            if (i % 100000 === 0) {
              const temp = new Array(1000).fill(i).map(x => x * Math.random());
              result += temp.reduce((a, b) => a + b, 0);
            }
          }
          
          if (Date.now() - startTime < duration) {
            setTimeout(heavyTask, 10); // Reduced delay for more continuous stress
          } else {
            parent.postMessage({
              type: 'testComplete',
              result: 'Heavy CPU task completed with result: ' + result.toFixed(2)
            }, '*');
          }
        }
        
        heavyTask();
      `
    },
    {
      name: 'DOM Manipulation',
      description: 'Creates and modifies many DOM elements rapidly',
      duration: 3000,
      code: `
        const startTime = Date.now();
        const duration = 3000;
        const container = document.createElement('div');
        document.body.appendChild(container);
        
        function domTask() {
          for (let i = 0; i < 100; i++) {
            const div = document.createElement('div');
            div.textContent = 'Element ' + i + ' - ' + Math.random();
            div.style.background = \`hsl(\${Math.random() * 360}, 50%, 50%)\`;
            container.appendChild(div);
          }
          
          // Remove some elements
          const children = container.children;
          for (let i = children.length - 1; i >= Math.max(0, children.length - 50); i--) {
            container.removeChild(children[i]);
          }
          
          if (Date.now() - startTime < duration) {
            requestAnimationFrame(domTask);
          } else {
            parent.postMessage({
              type: 'testComplete',
              result: 'DOM manipulation completed'
            }, '*');
          }
        }
        
        domTask();
      `
    },
    {
      name: 'Animation Stress Test',
      description: 'Runs multiple CSS animations simultaneously',
      duration: 5000,
      code: `
        const startTime = Date.now();
        const duration = 5000;
        
        // Create animated elements
        for (let i = 0; i < 50; i++) {
          const div = document.createElement('div');
          div.style.cssText = \`
            position: absolute;
            width: 20px;
            height: 20px;
            background: hsl(\${i * 7}, 70%, 50%);
            border-radius: 50%;
            left: \${Math.random() * 80}%;
            top: \${Math.random() * 80}%;
            animation: bounce 1s infinite alternate ease-in-out;
            animation-delay: \${Math.random() * 2}s;
          \`;
          document.body.appendChild(div);
        }
        
        // Add animation keyframes
        const style = document.createElement('style');
        style.textContent = \`
          @keyframes bounce {
            from { transform: translateY(0px) scale(1); }
            to { transform: translateY(-100px) scale(1.5); }
          }
        \`;
        document.head.appendChild(style);
        
        setTimeout(() => {
          parent.postMessage({
            type: 'testComplete',
            result: 'Animation stress test completed'
          }, '*');
        }, duration);
      `
    },
    {
      name: 'Memory Allocation',
      description: 'Allocates and deallocates large amounts of memory',
      duration: 4000,
      code: `
        const startTime = Date.now();
        const duration = 4000;
        let arrays = [];
        
        function memoryTask() {
          // Allocate memory
          for (let i = 0; i < 100; i++) {
            arrays.push(new Array(10000).fill(Math.random()));
          }
          
          // Deallocate some memory
          if (arrays.length > 500) {
            arrays = arrays.slice(250);
          }
          
          if (Date.now() - startTime < duration) {
            setTimeout(memoryTask, 10);
          } else {
            arrays = null;
            parent.postMessage({
              type: 'testComplete',
              result: 'Memory allocation test completed'
            }, '*');
          }
        }
        
        memoryTask();
      `
    },
    {
      name: 'Network Simulation',
      description: 'Simulates network requests and data processing',
      duration: 3000,
      code: `
        const startTime = Date.now();
        const duration = 3000;
        let requestCount = 0;
        
        function simulateRequest() {
          return new Promise(resolve => {
            // Simulate network delay
            setTimeout(() => {
              // Simulate data processing
              const data = new Array(1000).fill(0).map(() => ({
                id: Math.random(),
                value: Math.random() * 1000,
                processed: Date.now()
              }));
              
              // Process the data
              const processed = data.map(item => ({
                ...item,
                calculated: item.value * Math.sin(item.id) + Math.cos(item.value)
              }));
              
              resolve(processed);
            }, Math.random() * 100);
          });
        }
        
        async function networkTask() {
          const promises = [];
          for (let i = 0; i < 10; i++) {
            promises.push(simulateRequest());
          }
          
          await Promise.all(promises);
          requestCount += 10;
          
          if (Date.now() - startTime < duration) {
            setTimeout(networkTask, 50);
          } else {
            parent.postMessage({
              type: 'testComplete',
              result: \`Network simulation completed with \${requestCount} requests\`
            }, '*');
          }
        }
        
        networkTask();
      `
    },
    {
      name: 'Main Thread Blocker',
      description: 'Intentionally blocks the main thread to show the difference',
      duration: 2000,
      code: `
        const startTime = Date.now();
        const duration = 2000;
        
        // This will definitely block the main thread
        function blockingTask() {
          const blockStart = Date.now();
          while (Date.now() - blockStart < 500) {
            // Synchronous blocking operation
            let result = 0;
            for (let i = 0; i < 10000000; i++) {
              result += Math.random() * Math.sin(i);
            }
          }
          
          if (Date.now() - startTime < duration) {
            setTimeout(blockingTask, 50);
          } else {
            parent.postMessage({
              type: 'testComplete',
              result: 'Main thread blocking test completed'
            }, '*');
          }
        }
        
        blockingTask();
      `
    }
  ];

  constructor(private searchService: SearchService) {}

  ngOnInit() {
    // Subscribe to search highlights
    this.searchService.highlightedSection$.subscribe((sectionId: string) => {
      this.highlightedSection = sectionId;
    });

    // Listen for messages from iframe
    window.addEventListener('message', this.handleIframeMessage.bind(this));
    
    // Start monitoring main thread FPS
    this.startMainThreadMonitoring();
    
    // Initialize iframe with baseline monitoring
    this.initializeIframeMonitoring();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('message', this.handleIframeMessage.bind(this));
    this.stopMainThreadMonitoring();
  }

  private handleIframeMessage(event: MessageEvent) {
    if (event.data?.type === 'testComplete') {
      this.completeTest(event.data.result);
    } else if (event.data?.type === 'fpsUpdate') {
      this.iframeFPS = event.data.fps;
      this.iframeActive = true;
    } else if (event.data?.type === 'iframeReady') {
      this.iframeActive = true;
    }
  }

  private initializeIframeMonitoring() {
    // Create a simple iframe with FPS monitoring
    const basicIframeContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            margin: 0; 
            padding: 20px; 
            font-family: Arial, sans-serif; 
            background: #1a1a1a; 
            color: white; 
          }
        </style>
      </head>
      <body>
        <div>Iframe monitoring ready...</div>
        
        <script>
          // Basic FPS monitoring in iframe
          let frameCount = 0;
          let lastTime = performance.now();
          
          function monitorIframeFPS() {
            const now = performance.now();
            frameCount++;
            
            if (now - lastTime >= 1000) {
              const fps = Math.round(frameCount * 1000 / (now - lastTime));
              parent.postMessage({ type: 'fpsUpdate', fps: fps }, '*');
              frameCount = 0;
              lastTime = now;
            }
            
            requestAnimationFrame(monitorIframeFPS);
          }
          
          // Signal that iframe is ready
          parent.postMessage({ type: 'iframeReady' }, '*');
          monitorIframeFPS();
        </script>
      </body>
      </html>
    `;

    // Set initial iframe content for monitoring
    setTimeout(() => {
      if (this.testIframe?.nativeElement && !this.isRunning) {
        const iframe = this.testIframe.nativeElement;
        iframe.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(basicIframeContent);
      }
    }, 100);
  }

  private startMainThreadMonitoring() {
    const monitorFPS = () => {
      const now = performance.now();
      this.mainThreadFrameCount++;

      if (now - this.lastMainThreadTime >= 1000) {
        const currentFPS = Math.round(this.mainThreadFrameCount * 1000 / (now - this.lastMainThreadTime));
        this.mainThreadFPS = currentFPS;
        
        // Update FPS history for stress detection
        this.fpsHistory.push(currentFPS);
        if (this.fpsHistory.length > 5) {
          this.fpsHistory.shift();
        }
        
        // Establish baseline FPS when not running tests
        if (!this.isRunning && this.fpsHistory.length >= 3) {
          const avgFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
          if (avgFPS > this.baselineFPS * 0.9) {
            this.baselineFPS = Math.min(60, avgFPS);
          }
        }
        
        // Detect main thread stress
        this.isMainThreadStressed = this.isRunning && (currentFPS < this.baselineFPS * 0.7);
        
        this.mainThreadFrameCount = 0;
        this.lastMainThreadTime = now;
      }

      this.mainThreadFrameId = requestAnimationFrame(monitorFPS);
    };
    
    this.lastMainThreadTime = performance.now();
    monitorFPS();
  }

  private stopMainThreadMonitoring() {
    if (this.mainThreadFrameId) {
      cancelAnimationFrame(this.mainThreadFrameId);
    }
  }

  runTest(test: PerformanceTest) {
    if (this.isRunning) return;

    this.isRunning = true;
    this.currentTest = test;

    // Create iframe content
    const iframeContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            margin: 0; 
            padding: 20px; 
            font-family: Arial, sans-serif; 
            background: #1a1a1a; 
            color: white; 
          }
          .status { 
            position: fixed; 
            top: 10px; 
            right: 10px; 
            background: #333; 
            padding: 10px; 
            border-radius: 5px; 
          }
        </style>
      </head>
      <body>
        <div class="status" id="status">Running: ${test.name}</div>
        <h3>Test: ${test.name}</h3>
        <p>${test.description}</p>
        <div id="output"></div>
        
        <script>
          // FPS monitoring in iframe
          let frameCount = 0;
          let lastTime = performance.now();
          
          function monitorIframeFPS() {
            const now = performance.now();
            frameCount++;
            
            if (now - lastTime >= 1000) {
              const fps = Math.round(frameCount * 1000 / (now - lastTime));
              parent.postMessage({ type: 'fpsUpdate', fps: fps }, '*');
              frameCount = 0;
              lastTime = now;
            }
            
            requestAnimationFrame(monitorIframeFPS);
          }
          
          monitorIframeFPS();
          
          // Run the test
          ${test.code}
        </script>
      </body>
      </html>
    `;

    // Set iframe content
    const iframe = this.testIframe.nativeElement;
    iframe.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(iframeContent);

    // Monitor for completion
    setTimeout(() => {
      if (this.isRunning) {
        this.completeTest('Test timed out');
      }
    }, test.duration + 2000);
  }

  private completeTest(result: string) {
    if (!this.currentTest || !this.isRunning) return;

    const finalFPS = this.mainThreadFPS;
    const averageTestFPS = this.fpsHistory.length > 0 ? 
      this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length : finalFPS;

    // More sophisticated blocking detection
    const fpsDropPercentage = ((this.baselineFPS - averageTestFPS) / this.baselineFPS) * 100;
    const mainThreadBlocked = fpsDropPercentage > 20 || this.isMainThreadStressed;

    const testResult: TestResult = {
      testName: this.currentTest.name,
      mainThreadBlocked,
      executionTime: this.currentTest.duration,
      frameDrops: Math.max(0, this.baselineFPS - averageTestFPS),
      description: result
    };

    this.testResults.unshift(testResult);
    this.isRunning = false;
    this.currentTest = null;
    this.isMainThreadStressed = false;

    // Restore baseline iframe monitoring
    setTimeout(() => this.initializeIframeMonitoring(), 500);

    // Keep only last 10 results
    if (this.testResults.length > 10) {
      this.testResults = this.testResults.slice(0, 10);
    }
  }

  runAllTests() {
    if (this.isRunning) return;

    let currentIndex = 0;
    
    const runNext = () => {
      if (currentIndex < this.performanceTests.length) {
        this.runTest(this.performanceTests[currentIndex]);
        
        // Wait for test to complete before running next
        const checkComplete = () => {
          if (!this.isRunning) {
            currentIndex++;
            setTimeout(() => runNext(), 1000); // 1 second delay between tests
          } else {
            setTimeout(checkComplete, 100);
          }
        };
        
        setTimeout(checkComplete, 100);
      }
    };
    
    runNext();
  }

  clearResults() {
    this.testResults = [];
  }

  getPerformanceAnalysis(): string {
    if (this.testResults.length === 0) {
      return 'No test results available';
    }

    const blockedTests = this.testResults.filter(r => r.mainThreadBlocked).length;
    const totalTests = this.testResults.length;
    const averageFrameDrops = this.testResults.reduce((sum, r) => sum + r.frameDrops, 0) / totalTests;

    return `
Analysis of ${totalTests} tests:
• Main thread blocked: ${blockedTests}/${totalTests} tests (${Math.round(blockedTests/totalTests*100)}%)
• Average frame drops: ${Math.round(averageFrameDrops)} FPS
• Iframe isolation: ${blockedTests === 0 ? 'Perfect' : blockedTests < totalTests/2 ? 'Good' : 'Poor'}
    `.trim();
  }

  copyResults() {
    const results = this.testResults.map(r => 
      `${r.testName}: ${r.mainThreadBlocked ? 'BLOCKED' : 'OK'} (${r.frameDrops} frame drops)`
    ).join('\n');
    
    const analysis = this.getPerformanceAnalysis();
    const output = `Iframe Performance Test Results\n\n${results}\n\n${analysis}`;
    
    navigator.clipboard.writeText(output);
  }

  // Getter methods for template
  get mainThreadStatus(): string {
    if (!this.isRunning) return 'Idle';
    if (this.isMainThreadStressed) return 'Stressed';
    return 'Normal';
  }

  get iframeStatus(): string {
    if (!this.iframeActive) return 'Initializing';
    if (!this.isRunning) return 'Ready';
    return 'Testing';
  }

  get mainThreadFpsClass(): string {
    if (!this.isRunning) return 'idle';
    if (this.isMainThreadStressed) return 'stressed';
    if (this.mainThreadFPS >= this.baselineFPS * 0.9) return 'good';
    if (this.mainThreadFPS >= this.baselineFPS * 0.7) return 'warning';
    return 'bad';
  }

  get iframeFpsClass(): string {
    if (!this.iframeActive) return 'inactive';
    if (this.iframeFPS >= 55) return 'good';
    if (this.iframeFPS >= 30) return 'warning';
    if (this.iframeFPS > 0) return 'bad';
    return 'inactive';
  }
}
