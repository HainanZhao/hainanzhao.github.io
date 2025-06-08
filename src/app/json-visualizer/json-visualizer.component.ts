import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchService } from '../shared/services/search.service';
import { UrlStateService } from '../shared/services/url-state.service';
import { Subject, takeUntil } from 'rxjs';
import * as d3 from 'd3';

interface JsonNode {
  name: string;
  value?: any;
  type: string;
  children?: JsonNode[];
  parent?: JsonNode;
}

@Component({
  selector: 'app-json-visualizer',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './json-visualizer.component.html',
  styleUrls: ['./json-visualizer.component.css'],
})
export class JsonVisualizerComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('svgContainer', { static: false }) svgContainer!: ElementRef;

  private destroy$ = new Subject<void>();
  highlightedSection = '';

  jsonInput: string = `{
  "name": "John Doe",
  "age": 30,
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001"
  },
  "hobbies": ["reading", "coding", "hiking"],
  "isActive": true,
  "balance": 1250.75,
  "metadata": {
    "created": "2024-01-15",
    "lastLogin": "2024-05-28T10:30:00Z",
    "preferences": {
      "theme": "dark",
      "notifications": true
    }
  }
}`;

  parsedJson: any = null;
  errorMessage: string = '';
  visualizationType: 'tree' | 'hierarchy' | 'network' = 'tree';

  private svg: any;
  private width = 1000; // Will be calculated dynamically
  private height = 800; // Increased from 600
  private margin = { top: 20, right: 120, bottom: 20, left: 120 };

  private svgGroup: any; // Group for zoom operations
  private zoom: any; // D3 zoom behavior
  private currentZoom = 1; // Track zoom level
  private zoomStep = 0.3; // Amount to zoom in/out per click

  constructor(
    private searchService: SearchService,
    private urlStateService: UrlStateService
  ) {}

  ngOnInit() {
    // Load URL state first
    this.loadUrlState();

    this.parseJson();

    // Subscribe to section highlighting
    this.searchService.highlightedSection$.pipe(takeUntil(this.destroy$)).subscribe(sectionId => {
      this.highlightedSection = sectionId;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit() {
    // Initialize SVG only if the container is available and JSON is parsed
    if (this.svgContainer && this.parsedJson && !this.errorMessage) {
      this.initializeSvg();
      this.visualizeJson();
    }
  }

  parseJson() {
    try {
      this.parsedJson = JSON.parse(this.jsonInput);
      this.errorMessage = '';
      // Update URL state after successful parsing
      this.updateUrlWithJsonVizState();
      // Initialize visualization after parsing if the view is ready
      setTimeout(() => {
        if (this.svgContainer && this.svgContainer.nativeElement) {
          this.initializeSvg();
          this.visualizeJson();
        }
      }, 0);
    } catch {
      this.errorMessage = 'Invalid JSON format';
      this.parsedJson = null;
    }
  }

  private initializeSvg() {
    if (!this.svgContainer || !this.svgContainer.nativeElement) {
      return;
    }

    d3.select(this.svgContainer.nativeElement).selectAll('*').remove();

    // Calculate width based on container
    const containerWidth = this.svgContainer.nativeElement.clientWidth || this.width;
    this.width = Math.max(containerWidth, 800); // Ensure minimum width of 800px

    // Create the main SVG element
    const svgElement = d3
      .select(this.svgContainer.nativeElement)
      .append('svg')
      .attr('width', '100%') // Set width to 100%
      .attr('height', this.height)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`) // Add viewBox for responsiveness
      .attr('preserveAspectRatio', 'xMidYMid meet'); // Preserve aspect ratio

    // Create a separate group for zoom transformations
    this.svgGroup = svgElement
      .append('g')
      .attr('class', 'zoom-group')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    // Set the svg to the inner group where we'll draw the visualization
    this.svg = this.svgGroup;

    // Initialize zoom behavior
    this.setupZoom();
  }

  private convertToHierarchy(obj: any, name: string = 'root'): JsonNode {
    const node: JsonNode = {
      name: name,
      type: Array.isArray(obj) ? 'array' : typeof obj,
      value: obj,
    };

    if (obj !== null && typeof obj === 'object') {
      node.children = [];
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          const child = this.convertToHierarchy(item, `[${index}]`);
          child.parent = node;
          node.children!.push(child);
        });
      } else {
        Object.keys(obj).forEach(key => {
          const child = this.convertToHierarchy(obj[key], key);
          child.parent = node;
          node.children!.push(child);
        });
      }
    }

    return node;
  }

  visualizeJson() {
    if (!this.parsedJson || !this.svg || !this.svgContainer || !this.svgContainer.nativeElement) {
      return;
    }

    this.svg.selectAll('*').remove();

    const root = this.convertToHierarchy(this.parsedJson, 'JSON');

    if (this.visualizationType === 'tree') {
      this.createTreeVisualization(root);
    } else if (this.visualizationType === 'hierarchy') {
      this.createHierarchyVisualization(root);
    } else {
      this.createNetworkVisualization(root);
    }
  }

  private createTreeVisualization(root: JsonNode) {
    const treeLayout = d3
      .tree<JsonNode>()
      .size([
        this.height - this.margin.top - this.margin.bottom,
        this.width - this.margin.left - this.margin.right,
      ]);

    const hierarchy = d3.hierarchy(root);
    const treeData = treeLayout(hierarchy);

    // Links
    this.svg
      .selectAll('.link')
      .data(treeData.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr(
        'd',
        d3
          .linkHorizontal()
          .x((d: any) => d.y)
          .y((d: any) => d.x)
      );

    // Nodes
    const nodes = this.svg
      .selectAll('.node')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.y},${d.x})`);

    nodes
      .append('circle')
      .attr('r', 8)
      .attr('class', (d: any) => `node-${d.data.type}`);

    nodes
      .append('text')
      .attr('dy', '0.35em')
      .attr('x', (d: any) => (d.children ? -12 : 12))
      .style('text-anchor', (d: any) => (d.children ? 'end' : 'start'))
      .text((d: any) => {
        if (d.data.type === 'object' || d.data.type === 'array') {
          return d.data.name;
        }
        return `${d.data.name}: ${this.formatValue(d.data.value)}`;
      });
  }

  private createHierarchyVisualization(root: JsonNode) {
    const pack = d3
      .pack<JsonNode>()
      .size([
        this.width - this.margin.left - this.margin.right,
        this.height - this.margin.top - this.margin.bottom,
      ])
      .padding(3);

    const hierarchy = d3
      .hierarchy(root)
      .sum((d: JsonNode) => (d.children ? 0 : 1))
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const packedData = pack(hierarchy);

    const nodes = this.svg
      .selectAll('.bubble')
      .data(packedData.descendants())
      .enter()
      .append('g')
      .attr('class', 'bubble')
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`);

    nodes
      .append('circle')
      .attr('r', (d: any) => d.r)
      .attr('class', (d: any) => `bubble-${d.data.type}`)
      .style('opacity', (d: any) => (d.children ? 0.3 : 0.8));

    nodes
      .append('text')
      .attr('dy', '0.35em')
      .style('text-anchor', 'middle')
      .style('font-size', (d: any) => Math.min(d.r / 3, 12) + 'px')
      .text((d: any) => {
        if (d.r < 20) return '';
        return d.data.name;
      });
  }

  private createNetworkVisualization(root: JsonNode) {
    const nodes: any[] = [];
    const links: any[] = [];

    const traverse = (node: JsonNode, parentId?: number) => {
      const nodeId = nodes.length;
      nodes.push({
        id: nodeId,
        name: node.name,
        type: node.type,
        value: node.value,
        group: node.type,
      });

      if (parentId !== undefined) {
        links.push({
          source: parentId,
          target: nodeId,
        });
      }

      if (node.children) {
        node.children.forEach(child => traverse(child, nodeId));
      }
    };

    traverse(root);

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force(
        'center',
        d3.forceCenter(
          (this.width - this.margin.left - this.margin.right) / 2,
          (this.height - this.margin.top - this.margin.bottom) / 2
        )
      );

    const link = this.svg
      .append('g')
      .selectAll('.network-link')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'network-link');

    const node = this.svg
      .append('g')
      .selectAll('.network-node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'network-node')
      .call(
        d3
          .drag<any, any>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    node
      .append('circle')
      .attr('r', 12)
      .attr('class', (d: any) => `network-node-${d.type}`);

    node
      .append('text')
      .attr('dy', '0.35em')
      .attr('x', 15)
      .text(
        (d: any) =>
          `${d.name}${d.type !== 'object' && d.type !== 'array' ? ': ' + this.formatValue(d.value) : ''}`
      );

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });
  }

  private formatValue(value: any): string {
    if (typeof value === 'string') {
      return `"${value.length > 20 ? value.substring(0, 20) + '...' : value}"`;
    }
    return String(value);
  }

  onVisualizationTypeChange() {
    // Update URL state when visualization type changes
    this.updateUrlWithJsonVizState();
    setTimeout(() => {
      if (this.svgContainer && this.svgContainer.nativeElement && this.parsedJson) {
        this.visualizeJson();
      }
    }, 0);
  }

  loadSampleData(sample: string) {
    switch (sample) {
      case 'simple':
        this.jsonInput = `{
  "name": "Simple Object",
  "count": 42,
  "active": true
}`;
        break;
      case 'complex':
        this.jsonInput = `{
  "users": [
    {
      "id": 1,
      "name": "Alice",
      "permissions": ["read", "write"],
      "profile": {
        "age": 25,
        "department": "Engineering"
      }
    },
    {
      "id": 2,
      "name": "Bob",
      "permissions": ["read"],
      "profile": {
        "age": 30,
        "department": "Marketing"
      }
    }
  ],
  "settings": {
    "theme": "dark",
    "language": "en",
    "features": {
      "beta": true,
      "experimental": false
    }
  }
}`;
        break;
      case 'array':
        this.jsonInput = `[
  {
    "city": "New York",
    "population": 8419000,
    "coordinates": [40.7128, -74.0060]
  },
  {
    "city": "Los Angeles", 
    "population": 3980000,
    "coordinates": [34.0522, -118.2437]
  },
  {
    "city": "Chicago",
    "population": 2716000,
    "coordinates": [41.8781, -87.6298]
  }
]`;
        break;
    }
    this.parseJson();
  }

  // Zoom functions
  zoomIn() {
    this.currentZoom += this.zoomStep;
    this.applyZoom();
  }

  zoomOut() {
    this.currentZoom = Math.max(0.1, this.currentZoom - this.zoomStep);
    this.applyZoom();
  }

  resetZoom() {
    this.currentZoom = 1;
    this.applyZoom();
  }

  private applyZoom() {
    // Apply zoom transformation to the SVG group
    if (this.svgGroup && this.zoom) {
      const transform = d3.zoomIdentity
        .translate(this.margin.left, this.margin.top)
        .scale(this.currentZoom);

      d3.select(this.svgContainer.nativeElement)
        .select('svg')
        .transition()
        .duration(300)
        .call(this.zoom.transform, transform);
    }
  }

  private setupZoom() {
    // Initialize D3 zoom behavior
    this.zoom = d3
      .zoom()
      .scaleExtent([0.1, 4]) // Set min/max zoom
      .on('zoom', event => {
        // Update current zoom level
        this.currentZoom = event.transform.k;
        // Apply the zoomed transform to the SVG group
        this.svgGroup.attr('transform', event.transform);
      });

    // Apply zoom behavior to the SVG
    d3.select(this.svgContainer.nativeElement)
      .select('svg')
      .call(this.zoom)
      .on('dblclick.zoom', null); // Disable double-click zoom
  }

  private loadUrlState(): void {
    const jsonDataString = this.urlStateService.getStateFromUrl('jsonViz');
    if (jsonDataString) {
      try {
        const jsonData = JSON.parse(jsonDataString);
        this.jsonInput = jsonData.jsonInput || this.jsonInput;
        this.visualizationType = jsonData.visualizationType || 'tree';
      } catch (error) {
        console.error('Error parsing JSON visualizer URL state:', error);
      }
    }
  }

  private updateUrlWithJsonVizState(): void {
    const state = {
      jsonInput: this.jsonInput,
      visualizationType: this.visualizationType,
    };
    this.urlStateService.updateUrlState('jsonViz', JSON.stringify(state));
  }

  shareJsonViz(event?: Event): void {
    const state = {
      jsonInput: this.jsonInput,
      visualizationType: this.visualizationType,
    };
    const buttonElement = event?.target as HTMLElement;
    this.urlStateService.shareUrlWithFeedback('jsonViz', JSON.stringify(state), buttonElement);
  }
}
