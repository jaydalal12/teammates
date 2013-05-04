package teammates.common.datatransfer;

import static teammates.common.Common.EOL;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.logging.Logger;

import teammates.common.Common;

public class StudentResultBundle {

	public StudentData student;
	
	public ArrayList<SubmissionAttributes> incoming = new ArrayList<SubmissionAttributes>();
	public ArrayList<SubmissionAttributes> outgoing = new ArrayList<SubmissionAttributes>();
	public ArrayList<SubmissionAttributes> selfEvaluations = new ArrayList<SubmissionAttributes>();

	public StudentResultSummary summary;

	@SuppressWarnings("unused")
	private static final Logger log = Common.getLogger();
	
	public StudentResultBundle(StudentData student){
		this.student = student;
		this.summary = new StudentResultSummary();
	}
	
	/** returns the self-evaluation selected from outgoing submissions */
	public SubmissionAttributes getSelfEvaluation() {
		for (SubmissionAttributes s : outgoing) {
			if (s.reviewee.equals(s.reviewer)) {
				return s;
			}
		}
		return null;
	}

	public void sortOutgoingByStudentNameAscending() {
		Collections.sort(outgoing, new Comparator<SubmissionAttributes>() {
			public int compare(SubmissionAttributes s1, SubmissionAttributes s2) {
				// email is appended to avoid mix ups due to two students with
				// same name.
				return (s1.revieweeName + s1.reviewee)
						.compareTo(s2.revieweeName + s2.reviewee);
			}
		});
	}

	public void sortIncomingByStudentNameAscending() {
		Collections.sort(incoming, new Comparator<SubmissionAttributes>() {
			public int compare(SubmissionAttributes s1, SubmissionAttributes s2) {
				// email is appended to avoid mix ups due to two students with
				// same name.
				return (s1.reviewerName + s1.reviewer)
						.compareTo(s2.reviewerName + s2.reviewer);
			}
		});
	}

	public void sortIncomingByFeedbackAscending() {
		Collections.sort(incoming, new Comparator<SubmissionAttributes>() {
			public int compare(SubmissionAttributes s1, SubmissionAttributes s2) {
				return s1.p2pFeedback.getValue().compareTo(
						s2.p2pFeedback.getValue());
			}
		});
	}

	public String getOwnerEmail() {
		for (SubmissionAttributes sb : outgoing) {
			if (sb.reviewee.equals(sb.reviewer)) {
				return sb.reviewer;
			}
		}
		return null;
	}
	
	public String toString(){
		return toString(0);
	}

	public String toString(int indent) {
		String indentString = Common.getIndent(indent);
		StringBuilder sb = new StringBuilder();
		sb.append(indentString + "claimedFromStudent:" + summary.claimedFromStudent
				+ EOL);
		sb.append(indentString + "claimedToInstructor:" + summary.claimedToInstructor + EOL);
		sb.append(indentString + "perceivedToStudent:" + summary.perceivedToStudent
				+ EOL);
		sb.append(indentString + "perceivedToInstructor:" + summary.perceivedToInstructor + EOL);

		sb.append(indentString + "outgoing:" + EOL);
		for (SubmissionAttributes submission : outgoing) {
			sb.append(submission.toString(indent + 2) + EOL);
		}

		sb.append(indentString + "incoming:" + EOL);
		for (SubmissionAttributes submission : incoming) {
			sb.append(submission.toString(indent + 2) + EOL);
		}
		
		sb.append(indentString + "self evaluations:" + EOL);
		for (SubmissionAttributes submission : selfEvaluations) {
			sb.append(submission.toString(indent + 2) + EOL);
		}
		
		return replaceMagicNumbers(sb.toString());
	}
	
	private String replaceMagicNumbers(String input){
		return input.replace(Common.UNINITIALIZED_INT + ".0", " NA")
				.replace(Common.UNINITIALIZED_INT + "", " NA")
				.replace(Common.POINTS_NOT_SUBMITTED + "", "NSB")
				.replace(Common.POINTS_NOT_SURE + "", "NSU");
	}

}
