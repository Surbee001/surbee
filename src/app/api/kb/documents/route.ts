import { NextRequest, NextResponse } from 'next/server';

// Mock data for demonstration - in production, this would connect to a database
const mockDocuments = [
  {
    id: '1',
    name: 'Project Requirements.pdf',
    type: 'application/pdf',
    size: 2048576,
    url: 'https://example.com/documents/project-requirements.pdf',
    category: 'documents',
    summary: 'Comprehensive project requirements document outlining features, technical specifications, and delivery timeline.',
    tags: ['requirements', 'project', 'specifications'],
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
    metadata: {
      author: 'John Doe',
      pages: 24,
    }
  },
  {
    id: '2',
    name: 'Design Mockups.jpg',
    type: 'image/jpeg',
    size: 1536000,
    url: 'https://example.com/images/design-mockups.jpg',
    category: 'images',
    summary: 'UI/UX design mockups for the main application interface, including navigation and component layouts.',
    tags: ['design', 'mockups', 'ui', 'ux'],
    createdAt: new Date('2024-01-20T14:15:00Z'),
    updatedAt: new Date('2024-01-20T14:15:00Z'),
    metadata: {
      dimensions: { width: 1920, height: 1080 }
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    let filteredDocuments = mockDocuments;
    
    if (category) {
      filteredDocuments = filteredDocuments.filter(doc => doc.category === category);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredDocuments = filteredDocuments.filter(doc =>
        doc.name.toLowerCase().includes(searchLower) ||
        doc.summary.toLowerCase().includes(searchLower) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    return NextResponse.json(filteredDocuments);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newDocument = {
      id: Math.random().toString(36).substring(7),
      name: body.name,
      type: body.type,
      size: body.size,
      url: body.url,
      category: body.category,
      summary: body.summary || 'No summary available',
      tags: body.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: body.metadata || {}
    };
    
    // In production, save to database
    mockDocuments.push(newDocument);
    
    return NextResponse.json(newDocument, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}