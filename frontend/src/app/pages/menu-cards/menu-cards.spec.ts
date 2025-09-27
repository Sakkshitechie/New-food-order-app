import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuCards } from './menu-cards';

describe('MenuCards', () => {
  let component: MenuCards;
  let fixture: ComponentFixture<MenuCards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuCards]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuCards);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
