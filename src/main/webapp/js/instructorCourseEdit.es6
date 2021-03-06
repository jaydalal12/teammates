/* global scrollToElement:false BootboxWrapper:false StatusType:false */
/* global COURSE_NAME:false COURSE_TIME_ZONE:false TimeZone:false courseTimeZone:false */

// global parameter to remember settings for custom access level

// to store the role of instructors (Co-owner, Manager, Observer, Tutor or Custom)
const instructorCourseEditInstructorAccessLevelWhenLoadingPage = [];
/**
 * to store the map of privilege values for Custom role only because the privilege
 * values of Custom role is set by user. So we have to save them first to retrieve
 * those values later.
 */
const instructorCourseEditDefaultPrivilegeValuesForCustomRole = [];

const instructorPrivilegeValues = [
    'canmodifycourse',
    'canmodifyinstructor',
    'canmodifysession',
    'canmodifystudent',
    'canviewstudentinsection',
    'cangivecommentinsection',
    'canviewcommentinsection',
    'canmodifycommentinsection',
    'cansubmitsessioninsection',
    'canviewsessioninsection',
    'canmodifysessioncommentinsection',
];

$(document).ready(() => {
    const numOfInstr = $("form[id^='formEditInstructor']").length;
    for (let i = 0; i < numOfInstr; i += 1) {
        const instrNum = i + 1;
        const instrRole = $(`#accessControlInfoForInstr${instrNum} div div p span`).html().trim();
        instructorCourseEditInstructorAccessLevelWhenLoadingPage.push(instrRole);
        checkTheRoleThatApplies(i + 1);
    }

    $('#courseEditLink').click(editCourse);
    $('a[id^="instrCancelLink"]').hide();
    $('a[id^="instrCancelLink"]').click(function () {
        const instrNum = $(this).attr('id').substring('instrCancelLink'.length);
        disableFormEditInstructor(instrNum);
    });
    bindCheckboxToggle();
    const index = $('#new-instructor-index').val();
    bindChangingRole(index);

    bindRemindInstructorLink();
    bindDeleteInstructorLink();

    if (typeof moment !== 'undefined') {
        const $selectElement = $(`#${COURSE_TIME_ZONE}`);
        TimeZone.prepareTimeZoneInput($selectElement);
        TimeZone.updateTimeZone($selectElement, courseTimeZone);

        $('#auto-detect-time-zone').on('click', () => {
            autoDetectTimeZone();
        });
    }
});

/**
 * Enable the user to edit one instructor and disable editting for other instructors
 * @param instructorNum
 * @param totalInstructors
 */
function enableEditInstructor(event) {
    const instructorNum = event.data.instructorIndex;
    const totalInstructors = event.data.total;
    for (let i = 1; i <= totalInstructors; i += 1) {
        if (i === instructorNum) {
            enableFormEditInstructor(i);
        } else {
            disableFormEditInstructor(i);
        }
    }
    hideNewInstructorForm();
}

/**
 * Enable formEditInstructor's input fields, display the "Save changes" button,
 * and disable the edit link.
 * @param number
 */
function enableFormEditInstructor(number) {
    $(`#instructorTable${number}`).find(':input').not('.immutable').prop('disabled', false);
    $(`#instrEditLink${number}`).hide();
    $(`#instrCancelLink${number}`).show();
    $(`#accessControlInfoForInstr${number}`).hide();
    $(`#accessControlEditDivForInstr${number}`).show();
    $(`#btnSaveInstructor${number}`).show();
    const instrRole = instructorCourseEditInstructorAccessLevelWhenLoadingPage[number - 1];
    if (instrRole === 'Custom') {
        showTunePermissionsDiv(number);
        showAllSpecialSectionAndSessionPermissionsDivs(number);
    }
}

/**
 * Disable formEditInstructor's input fields, hide the "Save changes" button,
 * and enable the edit link.
 * @param number
 */
function disableFormEditInstructor(number) {
    $(`#instructorTable${number}`).find(':input').not('.immutable').prop('disabled', true);
    $(`#instrEditLink${number}`).show();
    $(`#instrCancelLink${number}`).hide();
    $(`#accessControlInfoForInstr${number}`).show();
    $(`#accessControlEditDivForInstr${number}`).hide();
    $(`#btnSaveInstructor${number}`).hide();
    document.getElementById(`formEditInstructor${number}`).reset();
    const instrRole = instructorCourseEditInstructorAccessLevelWhenLoadingPage[number - 1];
    $(`input[id='instructorroleforinstructor${number}'][value='${instrRole}']`).prop('checked', true);
    hideAllTunePermissionsDivs(number);
}

function showNewInstructorForm() {
    $('#panelAddInstructor').show();
    $('#btnShowNewInstructorForm').hide();
    scrollToElement($('#panelAddInstructor')[0], { duration: 1000 });
}

function hideNewInstructorForm() {
    $('#panelAddInstructor').hide();
    $('#btnShowNewInstructorForm').show();
}

function hideAllTunePermissionsDivs(instrNum) {
    const $tunePermissionsDiv = $(`#tunePermissionsDivForInstructor${instrNum}`);
    $tunePermissionsDiv.find('div[id^="tuneSectionPermissionsDiv"]').each((i) => {
        hideTuneSessionnPermissionsDiv(instrNum, i);
        hideTuneSectionPermissionsDiv(instrNum, i);
    });
    $tunePermissionsDiv.hide();
}

function showAllSpecialSectionAndSessionPermissionsDivs(instrNum) {
    const $tunePermissionsDiv = $(`#tunePermissionsDivForInstructor${instrNum}`);
    $tunePermissionsDiv.find('div[id^="tuneSectionPermissionsDiv"]').each(function (i) {
        const $currTunePermissionsDiv = $(this);
        if ($currTunePermissionsDiv.data('is-originally-displayed')) {
            showTuneSectionPermissionsDiv(instrNum, i);
        }
        if ($currTunePermissionsDiv.find('div[id^="tuneSessionPermissionsDiv"]').data('is-originally-displayed')) {
            showTuneSessionnPermissionsDiv(instrNum, i);
        }
    });
}

function showTunePermissionsDiv(instrNum) {
    $(`#tunePermissionsDivForInstructor${instrNum}`).show();
}

function hideTunePermissionDiv(instrNum) {
    $(`#tunePermissionsDivForInstructor${instrNum}`).hide();
}

function showTuneSectionPermissionsDiv(instrNum, sectionNum) {
    $(`#tuneSectionPermissionsDiv${sectionNum}ForInstructor${instrNum}`).show();
    const numberOfSections = $(`select#section${sectionNum}forinstructor${instrNum} option`).length;
    const numOfVisibleSections = $(`#tunePermissionsDivForInstructor${1
                                  } div[id^='tuneSectionPermissionsDiv']`).filter(':visible').length;

    if (numOfVisibleSections === numberOfSections) {
        $(`#addSectionLevelForInstructor${instrNum}`).hide();
    }
    $(`#tuneSectionPermissionsDiv${sectionNum}ForInstructor${instrNum
         } input[name='issectiongroup${sectionNum}set']`).attr('value', 'true');
    setAddSectionLevelLink(instrNum);
}

function setAddSectionLevelLink(instrNum) {
    let foundNewLink = false;
    const allSectionSelects = $(`#tunePermissionsDivForInstructor${instrNum
                               } div[id^='tuneSectionPermissionsDiv']`).find('input[type=hidden]')
                                                                        .not("[name*='sessions']");
    for (let idx = 0; idx < allSectionSelects.length; idx += 1) {
        const item = $(allSectionSelects[idx]);
        if (item.attr('value') === 'false') {
            const sectionNumStr = item.attr('name').substring(14).slice(0, -3);
            $(`#addSectionLevelForInstructor${instrNum}`)
                .attr('onclick', `showTuneSectionPermissionsDiv(${instrNum}, ${sectionNumStr})`);
            foundNewLink = true;
            break;
        }
    }
    if (foundNewLink) {
        $(`#addSectionLevelForInstructor${instrNum}`).show();
    } else {
        $(`#addSectionLevelForInstructor${instrNum}`).hide();
    }
}

function hideTuneSectionPermissionsDiv(instrNum, sectionNum) {
    $(`#tuneSectionPermissionsDiv${sectionNum}ForInstructor${instrNum}`).hide();
    $(`#tuneSectionPermissionsDiv${sectionNum}ForInstructor${instrNum
         } input[name='issectiongroup${sectionNum}set']`).attr('value', 'false');
    $(`#addSectionLevelForInstructor${instrNum}`).show();
    setAddSectionLevelLink(instrNum);
}

function showTuneSessionnPermissionsDiv(instrNum, sectionNum) {
    $(`#tuneSessionPermissionsDiv${sectionNum}ForInstructor${instrNum}`).show();
    $(`#toggleSessionLevelInSection${sectionNum}ForInstructor${instrNum}`).html('Hide session-level permissions');
    $(`#toggleSessionLevelInSection${sectionNum}ForInstructor${instrNum}`)
        .attr('onclick', `hideTuneSessionnPermissionsDiv(${instrNum}, ${sectionNum})`);
    $(`#tuneSectionPermissionsDiv${sectionNum}ForInstructor${instrNum
         } input[name='issectiongroup${sectionNum}sessionsset']`).attr('value', 'true');
}

function hideTuneSessionnPermissionsDiv(instrNum, sectionNum) {
    $(`#tuneSessionPermissionsDiv${sectionNum}ForInstructor${instrNum}`).hide();
    $(`#toggleSessionLevelInSection${sectionNum}ForInstructor${instrNum}`)
        .html('Give different permissions for sessions in this section');
    $(`#toggleSessionLevelInSection${sectionNum}ForInstructor${instrNum}`)
        .attr('onclick', `showTuneSessionnPermissionsDiv(${instrNum}, ${sectionNum})`);
    $(`#tuneSectionPermissionsDiv${sectionNum}ForInstructor${instrNum
         } input[name='issectiongroup${sectionNum}sessionsset']`).attr('value', 'false');
}

function checkTheRoleThatApplies(instrNum) {
    const instrRole = $(`#accessControlInfoForInstr${instrNum} div div p span`).html();
    $(`input[id='instructorroleforinstructor${instrNum}']`).filter(`[value='${instrRole}']`).prop('checked', true);
    if (instrRole === 'Custom') {
        // Save original values of Custom Role
        instructorCourseEditDefaultPrivilegeValuesForCustomRole[instrNum] = {};
        for (let i = 0; i < instructorPrivilegeValues.length; i += 1) {
            const checkValue = $(`#tunePermissionsDivForInstructor${instrNum
                                } input[name='${instructorPrivilegeValues[i]}']`).prop('checked');
            instructorCourseEditDefaultPrivilegeValuesForCustomRole[instrNum][instructorPrivilegeValues[i]] = checkValue;
        }

        checkPrivilegesOfRoleForInstructor(instrNum, instrRole);
    }
}

function checkPrivilegesOfRoleForInstructor(instrNum, role) {
    if (role === 'Co-owner') {
        checkPrivilegesOfCoownerForInstructor(instrNum);
    } else if (role === 'Manager') {
        checkPrivilegesOfManagerForInstructor(instrNum);
    } else if (role === 'Observer') {
        checkPrivilegesOfObserverForInstructor(instrNum);
    } else if (role === 'Tutor') {
        checkPrivilegesOfTutorForInstructor(instrNum);
    } else if (role === 'Custom') {
        checkPrivilegesOfCustomForInstructor(instrNum);
    }

    // do nothing if role not recognized
}

function checkPrivilegesOfCoownerForInstructor(instrNum) {
    hideTunePermissionDiv(instrNum);

    for (let i = 0; i < instructorPrivilegeValues.length; i += 1) {
        $(`#tunePermissionsDivForInstructor${instrNum
           } input[name='${instructorPrivilegeValues[i]}']`).prop('checked', true);
    }
}

function checkPrivilegesOfManagerForInstructor(instrNum) {
    checkPrivilegesOfCoownerForInstructor(instrNum);
    $(`#tunePermissionsDivForInstructor${instrNum} input[name='canmodifycourse']`).prop('checked', false);
}

function checkPrivilegesOfObserverForInstructor(instrNum) {
    checkPrivilegesOfCoownerForInstructor(instrNum);
    $(`#tunePermissionsDivForInstructor${instrNum} input[name='canmodifycourse']`).prop('checked', false);
    $(`#tunePermissionsDivForInstructor${instrNum} input[name='canmodifyinstructor']`).prop('checked', false);
    $(`#tunePermissionsDivForInstructor${instrNum} input[name='canmodifysession']`).prop('checked', false);
    $(`#tunePermissionsDivForInstructor${instrNum} input[name='canmodifystudent']`).prop('checked', false);
    $(`#tunePermissionsDivForInstructor${instrNum} input[name='cangivecommentinsection']`).prop('checked', false);
    $(`#tunePermissionsDivForInstructor${instrNum} input[name='canmodifycommentinsection']`).prop('checked', false);
    $(`#tunePermissionsDivForInstructor${instrNum} input[name='cansubmitsessioninsection']`).prop('checked', false);
    $(`#tunePermissionsDivForInstructor${instrNum
       } input[name='canmodifysessioncommentinsection']`).prop('checked', false);
}

function checkPrivilegesOfTutorForInstructor(instrNum) {
    checkPrivilegesOfCoownerForInstructor(instrNum);
    $(`#tunePermissionsDivForInstructor${instrNum} input[name='canmodifycourse']`).prop('checked', false);
    $(`#tunePermissionsDivForInstructor${instrNum} input[name='canmodifyinstructor']`).prop('checked', false);
    $(`#tunePermissionsDivForInstructor${instrNum} input[name='canmodifysession']`).prop('checked', false);
    $(`#tunePermissionsDivForInstructor${instrNum} input[name='canmodifystudent']`).prop('checked', false);
    $(`#tunePermissionsDivForInstructor${instrNum} input[name='canviewcommentinsection']`).prop('checked', false);
    $(`#tunePermissionsDivForInstructor${instrNum} input[name='canmodifycommentinsection']`).prop('checked', false);
    $(`#tunePermissionsDivForInstructor${instrNum
       } input[name='canmodifysessioncommentinsection']`).prop('checked', false);
}

function checkPrivilegesOfCustomForInstructor(instrNum) {
    const numOfInstr = $("form[id^='formEditInstructor']").length;
    const originalRole = instructorCourseEditInstructorAccessLevelWhenLoadingPage[instrNum - 1];

    if (instrNum <= numOfInstr && instrNum <= instructorCourseEditInstructorAccessLevelWhenLoadingPage.length) {
        if (originalRole === 'Custom') {
            // 'Custom' => 'Not Custom' => 'Custom'
            // restore old values
            for (let i = 0; i < instructorPrivilegeValues.length; i += 1) {
                const privilege = instructorPrivilegeValues[i];
                const valueToSet = instructorCourseEditDefaultPrivilegeValuesForCustomRole[instrNum][privilege];
                $(`#tunePermissionsDivForInstructor${instrNum
                   } input[name='${privilege}']`).prop('checked', valueToSet);
            }
        } else {
            // 'Not Custom' => 'Custom'
            checkPrivilegesOfRoleForInstructor(instrNum, originalRole);
        }
    } else {
        // New Instructor?
        // Custom role's privilege will be empty
        for (let j = 0; j < instructorPrivilegeValues.length; j += 1) {
            $(`#tunePermissionsDivForInstructor${instrNum
               } input[name='${instructorPrivilegeValues[j]}']`).prop('checked', false);
        }
    }
    showTunePermissionsDiv(instrNum);
}

function showInstructorRoleModal(instrRole) {
    const isValidRole = checkPrivilegesOfRoleForModal(instrRole);
    if (isValidRole) {
        $('#tunePermissionsDivForInstructorAll').modal();
    }
}

function checkPrivilegesOfRoleForModal(role) {
    if (role === 'Co-owner') {
        checkPrivilegesOfCoownerForModal();
    } else if (role === 'Manager') {
        checkPrivilegesOfManagerForModal();
    } else if (role === 'Observer') {
        checkPrivilegesOfObserverForModal();
    } else if (role === 'Tutor') {
        checkPrivilegesOfTutorForModal();
    } else {
        return false;
    }
    return true;
}

function checkPrivilegesOfCoownerForModal() {
    for (let i = 0; i < instructorPrivilegeValues.length; i += 1) {
        $(`#tunePermissionsDivForInstructorAll input[name='${instructorPrivilegeValues[i]}']`).prop('checked', true);
    }
    $('#tunePermissionsDivForInstructorAll #instructorRoleModalLabel').html('Permissions for Co-owner');
}

function checkPrivilegesOfManagerForModal() {
    checkPrivilegesOfCoownerForModal();

    $("#tunePermissionsDivForInstructorAll input[name='canmodifycourse']").prop('checked', false);

    $('#tunePermissionsDivForInstructorAll #instructorRoleModalLabel').html('Permissions for Manager');
}

function checkPrivilegesOfObserverForModal() {
    checkPrivilegesOfCoownerForModal();

    $("#tunePermissionsDivForInstructorAll input[name='canmodifycourse']").prop('checked', false);
    $("#tunePermissionsDivForInstructorAll input[name='canmodifyinstructor']").prop('checked', false);
    $("#tunePermissionsDivForInstructorAll input[name='canmodifysession']").prop('checked', false);
    $("#tunePermissionsDivForInstructorAll input[name='canmodifystudent']").prop('checked', false);
    $("#tunePermissionsDivForInstructorAll input[name='cangivecommentinsection']").prop('checked', false);
    $("#tunePermissionsDivForInstructorAll input[name='canmodifycommentinsection']").prop('checked', false);
    $("#tunePermissionsDivForInstructorAll input[name='cansubmitsessioninsection']").prop('checked', false);
    $("#tunePermissionsDivForInstructorAll input[name='canmodifysessioncommentinsection']").prop('checked', false);

    $('#tunePermissionsDivForInstructorAll #instructorRoleModalLabel').html('Permissions for Observer');
}

function checkPrivilegesOfTutorForModal() {
    checkPrivilegesOfCoownerForModal();

    $("#tunePermissionsDivForInstructorAll input[name='canmodifycourse']").prop('checked', false);
    $("#tunePermissionsDivForInstructorAll input[name='canmodifyinstructor']").prop('checked', false);
    $("#tunePermissionsDivForInstructorAll input[name='canmodifysession']").prop('checked', false);
    $("#tunePermissionsDivForInstructorAll input[name='canmodifystudent']").prop('checked', false);
    $("#tunePermissionsDivForInstructorAll input[name='canviewcommentinsection']").prop('checked', false);
    $("#tunePermissionsDivForInstructorAll input[name='canmodifycommentinsection']").prop('checked', false);
    $("#tunePermissionsDivForInstructorAll input[name='canmodifysessioncommentinsection']").prop('checked', false);

    $('#tunePermissionsDivForInstructorAll #instructorRoleModalLabel').html('Permissions for Tutor');
}

function bindDeleteInstructorLink() {
    $('[id^="instrDeleteLink"]').on('click', (event) => {
        event.preventDefault();
        const $clickedLink = $(event.target);

        const messageText = $clickedLink.data('isDeleteSelf')
                          ? `Are you sure you want to delete your instructor role from the course <strong>${
                               $clickedLink.data('courseId')}</strong>? `
                              + 'You will not be able to access the course anymore.'
                          : `Are you sure you want to delete the instructor <strong>${$clickedLink.data('instructorName')
                               }</strong> from the course <strong>${$clickedLink.data('courseId')}</strong>? `
                              + 'He/she will not be able to access the course anymore.';
        const okCallback = function () {
            window.location = $clickedLink.attr('href');
        };

        BootboxWrapper.showModalConfirmation('Confirm deleting instructor', messageText, okCallback, null,
                BootboxWrapper.DEFAULT_OK_TEXT, BootboxWrapper.DEFAULT_CANCEL_TEXT, StatusType.DANGER);
    });
}

function bindRemindInstructorLink() {
    $('[id^="instrRemindLink"]').on('click', (event) => {
        event.preventDefault();
        const $clickedLink = $(event.target);

        const messageText = `Do you wish to re-send the invitation email to instructor <strong>${
                           $clickedLink.data('instructorName')}</strong> from course <strong>${
                           $clickedLink.data('courseId')}</strong>`;
        const okCallback = function () {
            window.location = $clickedLink.attr('href');
        };

        BootboxWrapper.showModalConfirmation('Confirm re-sending invitation email', messageText, okCallback, null,
                BootboxWrapper.DEFAULT_OK_TEXT, BootboxWrapper.DEFAULT_CANCEL_TEXT, StatusType.INFO);
    });
}

function bindChangingRole(index) {
    $(`input[id^='instructorroleforinstructor${index}']`).change(function () {
        const idAttr = $(this).attr('id');
        const instrNum = parseInt(idAttr.substring(27), 10);
        const role = $(this).attr('value');
        checkPrivilegesOfRoleForInstructor(instrNum, role);
    });
}

function bindCheckboxToggle() {
    $('body').on('click', 'input[name^="cangivecommentinsection"]', (e) => {
        const target = $(e.target);
        const permissionGroup = target.closest('div');
        if (target.prop('checked')) {
            permissionGroup.find('input[name^="canviewstudentinsection"]').prop('checked', true);
        }
    });

    $('body').on('click', 'input[name^="canviewstudentinsection"]', (e) => {
        const target = $(e.target);
        const permissionGroup = target.closest('div');
        if (!target.prop('checked')) {
            permissionGroup.find('input[name^="cangivecommentinsection"]').prop('checked', false);
        }
    });

    $('body').on('click', 'input[name^="canmodifycommentinsection"]', (e) => {
        const target = $(e.target);
        const permissionGroup = target.closest('div');
        if (target.prop('checked')) {
            permissionGroup.find('input[name^="canviewcommentinsection"]').prop('checked', true);
        }
    });

    $('body').on('click', 'input[name^="canviewcommentinsection"]', (e) => {
        const target = $(e.target);
        const permissionGroup = target.closest('div');
        if (!target.prop('checked')) {
            permissionGroup.find('input[name^="canmodifycommentinsection"]').prop('checked', false);
        }
    });

    $('body').on('click', 'input[name^="canmodifysessioncommentinsection"]', (e) => {
        const target = $(e.target);
        const isIndividualSessionPrivilege = target.is('[name*="feedback"]');
        const permissionGroup = isIndividualSessionPrivilege ? target.closest('tr') : target.closest('div');
        if (target.prop('checked')) {
            permissionGroup.find('input[name^="canviewsessioninsection"]').prop('checked', true);
        }
    });

    $('body').on('click', 'input[name^="canviewsessioninsection"]', (e) => {
        const target = $(e.target);
        const isIndividualSessionPrivilege = target.is('[name*="feedback"]');
        const permissionGroup = isIndividualSessionPrivilege ? target.closest('tr') : target.closest('div');
        if (!target.prop('checked')) {
            permissionGroup.find('input[name^="canmodifysessioncommentinsection"]').prop('checked', false);
        }
    });
}

/**
 * Activates the edit course form.
 */
function editCourse() {
    $('#btnSaveCourse').show();
    $(`#${COURSE_NAME}`).prop('disabled', false);
    $(`#${COURSE_TIME_ZONE}`).prop('disabled', false);
    $('#auto-detect-time-zone').prop('disabled', false);
    $('#courseEditLink').hide();
}

function autoDetectTimeZone() {
    const $selectElement = $(`#${COURSE_TIME_ZONE}`);
    TimeZone.autoDetectAndUpdateTimeZone($selectElement);
}

/*
export default {
    enableEditInstructor,
    showNewInstructorForm,
    showInstructorRoleModal,
};
*/
