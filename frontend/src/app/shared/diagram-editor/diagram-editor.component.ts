import { Component, OnInit, OnDestroy, AfterViewInit, OnChanges, SimpleChanges, ElementRef, ViewChild, Input, Output, EventEmitter, signal, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import Konva from 'konva';

export type ToolType = 'select' | 'player' | 'cone' | 'ball' | 'arrow' | 'zone' | 'goal';
export type BackgroundType = 'blank' | 'half-pitch' | 'full-pitch';

export interface DiagramObject {
  id: string;
  type: string;
  x: number;
  y: number;
  [key: string]: any;
}

@Component({
  selector: 'app-diagram-editor',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    MatTooltipModule
  ],
  template: `
    <div class="diagram-editor">
      <!-- Toolbar -->
      @if (!readOnly) {
        <div class="toolbar">
        <mat-button-toggle-group [(value)]="selectedTool" (change)="onToolChange()">
          <mat-button-toggle value="select" matTooltip="Select/Move">
            <mat-icon>pan_tool</mat-icon>
          </mat-button-toggle>
          <mat-button-toggle value="player" matTooltip="Add Player">
            <mat-icon>person</mat-icon>
          </mat-button-toggle>
          <mat-button-toggle value="cone" matTooltip="Add Cone">
            <mat-icon>change_history</mat-icon>
          </mat-button-toggle>
          <mat-button-toggle value="ball" matTooltip="Add Ball">
            <mat-icon>sports_soccer</mat-icon>
          </mat-button-toggle>
          <mat-button-toggle value="arrow" matTooltip="Draw Arrow">
            <mat-icon>arrow_forward</mat-icon>
          </mat-button-toggle>
          <mat-button-toggle value="zone" matTooltip="Draw Zone">
            <mat-icon>crop_square</mat-icon>
          </mat-button-toggle>
          <mat-button-toggle value="goal" matTooltip="Add Goal">
            <mat-icon>sports_score</mat-icon>
          </mat-button-toggle>
        </mat-button-toggle-group>

        <div class="toolbar-actions">
          <button mat-icon-button (click)="undo()" [disabled]="!canUndo()" matTooltip="Undo">
            <mat-icon>undo</mat-icon>
          </button>
          <button mat-icon-button (click)="redo()" [disabled]="!canRedo()" matTooltip="Redo">
            <mat-icon>redo</mat-icon>
          </button>
          <button mat-icon-button (click)="deleteSelected()" [disabled]="!hasSelection()" matTooltip="Delete">
            <mat-icon>delete</mat-icon>
          </button>
          <button mat-icon-button (click)="clear()" matTooltip="Clear All">
            <mat-icon>clear_all</mat-icon>
          </button>
        </div>

        </div>
      }

      <!-- Canvas Container -->
      <div class="canvas-container">
        <div #container class="konva-container"></div>
      </div>
    </div>
  `,
  styles: [`
    .diagram-editor {
      display: flex;
      flex-direction: column;
      height: 600px;
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
    }

    .toolbar {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px;
      background: #f5f5f5;
      border-bottom: 1px solid #ddd;
      flex-wrap: wrap;
    }

    .toolbar-actions {
      display: flex;
      gap: 4px;
    }

    .toolbar-background {
      margin-left: auto;
    }

    .canvas-container {
      flex: 1;
      position: relative;
      overflow: hidden;
      background: #fff;
    }

    .konva-container {
      width: 100%;
      height: 100%;
    }
  `]
})
export class DiagramEditorComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('container', { static: false }) containerRef!: ElementRef<HTMLDivElement>;
  @Input() initialData?: any;
  @Input() readOnly = false;
  @Output() diagramChange = new EventEmitter<any>();

  private cdr = inject(ChangeDetectorRef);

  selectedTool: ToolType = 'select';
  background: BackgroundType = 'half-pitch'; // Fixed to half-pitch only

  private stage!: Konva.Stage;
  private layer!: Konva.Layer;
  private backgroundLayer!: Konva.Layer;
  private transformer!: Konva.Transformer;
  
  private history: any[] = [];
  private historyStep = 0;
  private isDrawingArrow = false;
  private tempArrow: Konva.Arrow | null = null;
  private isDrawingZone = false;
  private tempZone: Konva.Rect | null = null;
  private drawStartPos: { x: number; y: number } | null = null;

  ngOnInit() {
    // Always use half-pitch background
    this.background = 'half-pitch';
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialData'] && !changes['initialData'].firstChange && this.layer) {
      // Always use half-pitch background
      this.background = 'half-pitch';
      this.layer.destroyChildren();
      this.layer.add(this.transformer);
      this.drawBackground();
      this.backgroundLayer.draw();
      if (changes['initialData'].currentValue?.objects) {
        this.loadDiagram(changes['initialData'].currentValue);
      }
      this.layer.draw();
    }
  }

  ngAfterViewInit() {
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.initKonva();
      if (this.initialData?.objects) {
        this.loadDiagram(this.initialData);
      } else {
        // Emit initial empty diagram with default background
        this.emitChange();
      }
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.stage?.destroy();
  }

  private initKonva() {
    const container = this.containerRef.nativeElement;
    const width = container.offsetWidth;
    const height = container.offsetHeight || 500;

    this.stage = new Konva.Stage({
      container: container,
      width: width,
      height: height,
    });

    this.backgroundLayer = new Konva.Layer({
      listening: false // Background should not intercept events
    });
    this.layer = new Konva.Layer();
    this.stage.add(this.backgroundLayer);
    this.stage.add(this.layer);

    this.transformer = new Konva.Transformer({
      rotateEnabled: false,
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    });
    this.layer.add(this.transformer);

    this.drawBackground();
    this.backgroundLayer.draw(); // Force immediate draw
    this.setupEventListeners();
    this.saveState();
  }

  private setupEventListeners() {
    this.stage.on('click', (e) => {
      if (e.target === this.stage) {
        this.transformer.nodes([]);
        return;
      }

      if (this.selectedTool === 'select') {
        const clickedNode = e.target;
        if (clickedNode !== this.stage && clickedNode.getLayer() !== this.backgroundLayer) {
          this.transformer.nodes([clickedNode]);
        }
      }
    });

    this.stage.on('mousedown touchstart', (e) => {
      // Only add objects when clicking on empty stage (background doesn't listen)
      if (e.target !== this.stage) return;

      const pos = this.stage.getPointerPosition();
      if (!pos) return;

      if (this.selectedTool === 'arrow') {
        this.startDrawingArrow(pos);
      } else if (this.selectedTool === 'zone') {
        this.startDrawingZone(pos);
      } else if (this.selectedTool !== 'select') {
        this.addObject(this.selectedTool, pos);
      }
    });

    this.stage.on('mousemove touchmove', (e) => {
      const pos = this.stage.getPointerPosition();
      if (!pos) return;

      if (this.isDrawingArrow && this.tempArrow) {
        this.updateArrow(pos);
      } else if (this.isDrawingZone && this.tempZone) {
        this.updateZone(pos);
      }
    });

    this.stage.on('mouseup touchend', () => {
      if (this.isDrawingArrow) {
        this.finishDrawingArrow();
      } else if (this.isDrawingZone) {
        this.finishDrawingZone();
      }
    });

    // Save state on any change
    this.layer.on('dragend', () => {
      this.saveState();
      this.emitChange();
    });
    this.layer.on('transformend', () => {
      this.saveState();
      this.emitChange();
    });
  }

  private addObject(type: ToolType, pos: { x: number; y: number }) {
    let shape: Konva.Shape | Konva.Group;

    switch (type) {
      case 'player':
        shape = this.createPlayer(pos);
        break;
      case 'cone':
        shape = this.createCone(pos);
        break;
      case 'ball':
        shape = this.createBall(pos);
        break;
      case 'goal':
        shape = this.createGoal(pos);
        break;
      default:
        return;
    }

    this.layer.add(shape);
    this.saveState();
    this.emitChange();
  }

  private createPlayer(pos: { x: number; y: number }): Konva.Group {
    const group = new Konva.Group({
      x: pos.x,
      y: pos.y,
      draggable: true,
    });

    const circle = new Konva.Circle({
      radius: 15,
      fill: '#3498db',
      stroke: '#2c3e50',
      strokeWidth: 2,
    });

    const text = new Konva.Text({
      text: 'P',
      fontSize: 14,
      fontStyle: 'bold',
      fill: 'white',
      align: 'center',
      verticalAlign: 'middle',
      offsetX: 4,
      offsetY: 7,
    });

    group.add(circle);
    group.add(text);
    return group;
  }

  private createCone(pos: { x: number; y: number }): Konva.RegularPolygon {
    return new Konva.RegularPolygon({
      x: pos.x,
      y: pos.y,
      sides: 3,
      radius: 12,
      fill: '#f39c12',
      stroke: '#e67e22',
      strokeWidth: 2,
      draggable: true,
    });
  }

  private createBall(pos: { x: number; y: number }): Konva.Circle {
    return new Konva.Circle({
      x: pos.x,
      y: pos.y,
      radius: 10,
      fill: 'white',
      stroke: '#2c3e50',
      strokeWidth: 2,
      draggable: true,
    });
  }

  private createGoal(pos: { x: number; y: number }): Konva.Group {
    const group = new Konva.Group({
      x: pos.x,
      y: pos.y,
      draggable: true,
    });

    const rect = new Konva.Rect({
      width: 60,
      height: 40,
      fill: 'rgba(255, 255, 255, 0.3)',
      stroke: '#e74c3c',
      strokeWidth: 3,
    });

    const net = new Konva.Line({
      points: [0, 0, 60, 40, 0, 40, 60, 0],
      stroke: '#e74c3c',
      strokeWidth: 1,
    });

    group.add(rect);
    group.add(net);
    return group;
  }

  private startDrawingArrow(pos: { x: number; y: number }) {
    this.isDrawingArrow = true;
    this.drawStartPos = pos;
    this.tempArrow = new Konva.Arrow({
      points: [pos.x, pos.y, pos.x, pos.y],
      pointerLength: 10,
      pointerWidth: 10,
      fill: '#e74c3c',
      stroke: '#e74c3c',
      strokeWidth: 3,
    });
    this.layer.add(this.tempArrow);
  }

  private updateArrow(pos: { x: number; y: number }) {
    if (this.tempArrow && this.drawStartPos) {
      this.tempArrow.points([this.drawStartPos.x, this.drawStartPos.y, pos.x, pos.y]);
    }
  }

  private finishDrawingArrow() {
    this.isDrawingArrow = false;
    this.drawStartPos = null;
    this.tempArrow = null;
    this.saveState();
    this.emitChange();
  }

  private startDrawingZone(pos: { x: number; y: number }) {
    this.isDrawingZone = true;
    this.drawStartPos = pos;
    this.tempZone = new Konva.Rect({
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
      fill: 'rgba(46, 204, 113, 0.2)',
      stroke: '#27ae60',
      strokeWidth: 2,
      draggable: true,
    });
    this.layer.add(this.tempZone);
  }

  private updateZone(pos: { x: number; y: number }) {
    if (this.tempZone && this.drawStartPos) {
      const width = pos.x - this.drawStartPos.x;
      const height = pos.y - this.drawStartPos.y;
      
      this.tempZone.width(Math.abs(width));
      this.tempZone.height(Math.abs(height));
      this.tempZone.x(width < 0 ? pos.x : this.drawStartPos.x);
      this.tempZone.y(height < 0 ? pos.y : this.drawStartPos.y);
    }
  }

  private finishDrawingZone() {
    this.isDrawingZone = false;
    this.drawStartPos = null;
    this.tempZone = null;
    this.saveState();
    this.emitChange();
  }

  private drawBackground() {
    this.backgroundLayer.destroyChildren();

    const width = this.stage.width();
    const height = this.stage.height();

    if (this.background === 'blank') {
      const bg = new Konva.Rect({
        width: width,
        height: height,
        fill: '#f0f0f0',
      });
      this.backgroundLayer.add(bg);
    } else if (this.background === 'half-pitch') {
      this.drawHalfPitch(width, height);
    } else if (this.background === 'full-pitch') {
      this.drawFullPitch(width, height);
    }
  }

  private drawHalfPitch(width: number, height: number) {
    const bg = new Konva.Rect({
      width: width,
      height: height,
      fill: '#7cb342',
    });
    this.backgroundLayer.add(bg);

    const pitchWidth = width - 100;
    const pitchHeight = height - 100;

    // Pitch outline
    const outline = new Konva.Rect({
      x: 50,
      y: 50,
      width: pitchWidth,
      height: pitchHeight,
      stroke: 'white',
      strokeWidth: 3,
    });
    this.backgroundLayer.add(outline);

    // Center circle (at bottom for half pitch)
    const centerCircle = new Konva.Circle({
      x: width / 2,
      y: height - 50,
      radius: 50,
      stroke: 'white',
      strokeWidth: 3,
    });
    this.backgroundLayer.add(centerCircle);

    // Penalty area (18-yard box) - more proportional
    const penaltyWidth = pitchWidth * 0.5; // 50% of pitch width
    const penaltyHeight = pitchHeight * 0.35; // 35% of pitch height
    const penaltyArea = new Konva.Rect({
      x: width / 2 - penaltyWidth / 2,
      y: 50,
      width: penaltyWidth,
      height: penaltyHeight,
      stroke: 'white',
      strokeWidth: 3,
    });
    this.backgroundLayer.add(penaltyArea);

    // Goal area (6-yard box) - more proportional
    const goalWidth = pitchWidth * 0.25; // 25% of pitch width
    const goalHeight = pitchHeight * 0.15; // 15% of pitch height
    const goalArea = new Konva.Rect({
      x: width / 2 - goalWidth / 2,
      y: 50,
      width: goalWidth,
      height: goalHeight,
      stroke: 'white',
      strokeWidth: 3,
    });
    this.backgroundLayer.add(goalArea);

    // Penalty spot
    const penaltySpot = new Konva.Circle({
      x: width / 2,
      y: 50 + penaltyHeight * 0.65,
      radius: 3,
      fill: 'white',
    });
    this.backgroundLayer.add(penaltySpot);
  }

  private drawFullPitch(width: number, height: number) {
    const bg = new Konva.Rect({
      width: width,
      height: height,
      fill: '#7cb342',
    });
    this.backgroundLayer.add(bg);

    const pitchWidth = width - 100;
    const pitchHeight = height - 100;

    // Pitch outline
    const outline = new Konva.Rect({
      x: 50,
      y: 50,
      width: pitchWidth,
      height: pitchHeight,
      stroke: 'white',
      strokeWidth: 3,
    });
    this.backgroundLayer.add(outline);

    // Center line
    const centerLine = new Konva.Line({
      points: [50, height / 2, width - 50, height / 2],
      stroke: 'white',
      strokeWidth: 3,
    });
    this.backgroundLayer.add(centerLine);

    // Center circle
    const centerCircle = new Konva.Circle({
      x: width / 2,
      y: height / 2,
      radius: 50,
      stroke: 'white',
      strokeWidth: 3,
    });
    this.backgroundLayer.add(centerCircle);

    // Center spot
    const centerSpot = new Konva.Circle({
      x: width / 2,
      y: height / 2,
      radius: 3,
      fill: 'white',
    });
    this.backgroundLayer.add(centerSpot);

    // Top penalty area
    const penaltyWidth = pitchWidth * 0.5;
    const penaltyHeight = pitchHeight * 0.25;
    const topPenaltyArea = new Konva.Rect({
      x: width / 2 - penaltyWidth / 2,
      y: 50,
      width: penaltyWidth,
      height: penaltyHeight,
      stroke: 'white',
      strokeWidth: 3,
    });
    this.backgroundLayer.add(topPenaltyArea);

    // Bottom penalty area
    const bottomPenaltyArea = new Konva.Rect({
      x: width / 2 - penaltyWidth / 2,
      y: height - 50 - penaltyHeight,
      width: penaltyWidth,
      height: penaltyHeight,
      stroke: 'white',
      strokeWidth: 3,
    });
    this.backgroundLayer.add(bottomPenaltyArea);

    // Top goal area
    const goalWidth = pitchWidth * 0.25;
    const goalHeight = pitchHeight * 0.12;
    const topGoalArea = new Konva.Rect({
      x: width / 2 - goalWidth / 2,
      y: 50,
      width: goalWidth,
      height: goalHeight,
      stroke: 'white',
      strokeWidth: 3,
    });
    this.backgroundLayer.add(topGoalArea);

    // Bottom goal area
    const bottomGoalArea = new Konva.Rect({
      x: width / 2 - goalWidth / 2,
      y: height - 50 - goalHeight,
      width: goalWidth,
      height: goalHeight,
      stroke: 'white',
      strokeWidth: 3,
    });
    this.backgroundLayer.add(bottomGoalArea);
  }

  onToolChange() {
    if (this.transformer) {
      this.transformer.nodes([]);
    }
  }

  onBackgroundChange() {
    this.drawBackground();
    this.backgroundLayer.draw();
    this.emitChange();
  }

  deleteSelected() {
    if (!this.transformer) return;
    const selected = this.transformer.nodes();
    selected.forEach(node => node.destroy());
    this.transformer.nodes([]);
    this.saveState();
    this.emitChange();
  }

  clear() {
    if (!this.layer) return;
    if (confirm('Clear all objects?')) {
      this.layer.destroyChildren();
      this.layer.add(this.transformer);
      this.saveState();
      this.emitChange();
    }
  }

  undo() {
    if (this.historyStep > 0) {
      this.historyStep--;
      this.restoreState(this.history[this.historyStep]);
    }
  }

  redo() {
    if (this.historyStep < this.history.length - 1) {
      this.historyStep++;
      this.restoreState(this.history[this.historyStep]);
    }
  }

  canUndo(): boolean {
    return this.historyStep > 0;
  }

  canRedo(): boolean {
    return this.historyStep < this.history.length - 1;
  }

  hasSelection(): boolean {
    return this.transformer?.nodes()?.length > 0;
  }

  private saveState() {
    const state = this.layer.toJSON();
    this.history = this.history.slice(0, this.historyStep + 1);
    this.history.push(state);
    this.historyStep++;
    
    // Limit history to 50 steps
    if (this.history.length > 50) {
      this.history.shift();
      this.historyStep--;
    }
  }

  private restoreState(state: string) {
    this.layer.destroyChildren();
    const layerData = Konva.Node.create(state);
    this.layer = layerData as Konva.Layer;
    this.stage.add(this.layer);
    
    this.transformer = this.layer.findOne('Transformer') as Konva.Transformer;
    if (!this.transformer) {
      this.transformer = new Konva.Transformer({
        rotateEnabled: false,
      });
      this.layer.add(this.transformer);
    }
    
    this.emitChange();
  }

  private loadDiagram(data: any) {
    if (!data || !data.objects || !Array.isArray(data.objects)) return;
    
    // Load each object from the saved data
    data.objects.forEach((obj: any) => {
      let shape: Konva.Shape | Konva.Group | null = null;
      
      switch (obj.type) {
        case 'Group':
          // Recreate player or goal
          if (obj.children && obj.children.some((c: any) => c.className === 'Circle')) {
            shape = this.createPlayer({ x: obj.x, y: obj.y });
          } else {
            shape = this.createGoal({ x: obj.x, y: obj.y });
          }
          break;
        case 'RegularPolygon':
          shape = this.createCone({ x: obj.x, y: obj.y });
          break;
        case 'Circle':
          shape = this.createBall({ x: obj.x, y: obj.y });
          break;
        case 'Arrow':
          if (obj.points && obj.points.length >= 4) {
            shape = new Konva.Arrow({
              points: obj.points,
              pointerLength: 10,
              pointerWidth: 10,
              fill: obj.fill || '#e74c3c',
              stroke: obj.stroke || '#e74c3c',
              strokeWidth: 3,
            });
          }
          break;
        case 'Rect':
          shape = new Konva.Rect({
            x: obj.x,
            y: obj.y,
            width: obj.width || 100,
            height: obj.height || 100,
            fill: obj.fill || 'rgba(46, 204, 113, 0.2)',
            stroke: obj.stroke || '#27ae60',
            strokeWidth: 2,
            draggable: true,
          });
          break;
      }
      
      if (shape) {
        this.layer.add(shape);
      }
    });
    
    this.saveState();
  }

  getDiagramData(): any {
    const objects: any[] = [];
    
    this.layer.children.forEach((node) => {
      if (node instanceof Konva.Transformer) return;
      
      const obj: any = {
        type: node.getClassName(),
        x: node.x(),
        y: node.y(),
      };

      if (node instanceof Konva.Arrow) {
        obj.points = node.points();
        obj.fill = node.fill();
        obj.stroke = node.stroke();
      } else if (node instanceof Konva.Rect) {
        obj.width = node.width();
        obj.height = node.height();
        obj.fill = node.fill();
        obj.stroke = node.stroke();
      } else if (node instanceof Konva.Group) {
        // Capture children info to distinguish player from goal
        obj.children = node.children.map(child => ({
          className: child.getClassName()
        }));
      }

      objects.push(obj);
    });

    return {
      background: this.background,
      objects: objects,
    };
  }

  private emitChange() {
    this.diagramChange.emit(this.getDiagramData());
  }
}
