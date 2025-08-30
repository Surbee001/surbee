import { NextRequest, NextResponse } from 'next/server';

// Mock data - in production, this would connect to a database
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const document = mockDocuments.find(doc => doc.id === params.id);
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const documentIndex = mockDocuments.findIndex(doc => doc.id === params.id);
    
    if (documentIndex === -1) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    // Update document
    mockDocuments[documentIndex] = {
      ...mockDocuments[documentIndex],
      ...body,
      updatedAt: new Date(),
    };
    
    return NextResponse.json(mockDocuments[documentIndex]);
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentIndex = mockDocuments.findIndex(doc => doc.id === params.id);
    
    if (documentIndex === -1) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    // Remove document
    const deletedDocument = mockDocuments.splice(documentIndex, 1)[0];
    
    return NextResponse.json({ 
      message: 'Document deleted successfully',
      document: deletedDocument 
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}