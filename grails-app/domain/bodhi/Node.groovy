package bodhi

class Node {

	static constraints = {
		content nullable: true
	}

    static mapping = {
	    content sqlType: 'text' // text maps to clob sql type
	    content nullable: true
    }

	static belongsTo = [ root: Root ]

	String content
	Date dateCreated, lastUpdated

	int leftBound, rightBound
}
