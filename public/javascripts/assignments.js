/**
 * Copyright (C) 2011 Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

(function initAssignmentsJs() {
  var defaultShowDateOptions = false;
  function hideAssignmentForm() {
    var $form = $("#add_assignment_form");
    var $assignment = $form.parents(".group_assignment");
    var $group = $assignment.parents(".assignment_group");
    $form.find("").end()
      .hide().appendTo($("body"));
    $assignment.removeClass('editing');
    $assignment.find(".content").show();
    if($assignment.attr('id') == "assignment_new") {
      $assignment.remove();
    } else {
      $assignment.find(":tabbable:first").focus();
    }
    if($group.find(".group_assignment").length === 0) {
      $group.find(".padding").show();
    }
  }
  var assignmentCount, assignmentGroupCount;
  if(!assignmentCount) { assignmentCount = 0; }
  if(!assignmentGroupCount) { assignmentGroupCount = 0; }
  function updateAssignmentCounts() {
    var assignmentCount = $(".group_assignment:visible").length;
    var assignmentGroupCount = $(".assignment_group:visible").length;
    $(".assignment_count").text(assignmentCount);
    $(".assignment_count_text").text(assignmentCount == 1 ? "Assignment" : "Assignments");
    $(".assignment_group_count").text(assignmentGroupCount);
    $(".assignment_group_count_text").text(assignmentGroupCount == 1 ? "Group" : "Groups");
  }
  function editAssignment($assignment) {
    hideAssignmentForm();
    $assignment.find(".content").hide()
      .before($("#add_assignment_form").show());
    $assignment.addClass('editing');
    var $group = $assignment.parents(".assignment_group");
    var group_data = $group.getTemplateData({textValues: ['default_assignment_name', 'assignment_group_id']});
    var title = group_data.default_assignment_name;
    title += " " + $group.find(".group_assignment").length;
    var $form = $assignment.find("#add_assignment_form");
    var buttonMsg = "Update";
    var url = $assignment.find(".edit_assignment_link").attr('href');
    if($assignment.attr('id') == 'assignment_new') {
      buttonMsg = "Add";
      url = $(".add_assignment_link.groupless_link:first").attr('href');
    }
    $assignment.find(".more_options_link").attr('href', url);
    $form.find("input[type='submit']").val(buttonMsg);
    var data = $assignment.getTemplateData({textValues: ["title", "points_possible", "due_date_string", "due_time_string", "assignment_group_id", "submission_types"]});
    data.title = data.title || title;
    if(data.submission_types != "online_quiz" && data.submission_types != "discussion_topic") {
      $form.find(".assignment_submission_types .current_submission_types").val(data.submission_types);
      $form.find(".assignment_submission_types").val(data.submission_types);
    }
    data.assignment_group_id = group_data.assignment_group_id;
    data.due_time = data.due_time_string;
    data.due_date = data.due_date_string;
    var due_at = Date.parse(data.due_date_string + " " + data.due_time_string);
    data.due_at = "";
    if(due_at) {
      data.due_at = due_at.toString($.datetime.defaultFormat);
    }
    if($assignment.attr('id') == 'assignment_new') {
      if(defaultShowDateOptions) {
        $form.find(".date_options").show();
        $form.find(".show_date_link").hide();
      } else {
        $form.find(".date_options").hide();
        $form.find(".show_date_link").show();
      }
      $form.attr('action', $("#add_assignment .assignments_url").attr('href'))
        .attr('method', 'POST');
    } else {
      if(data.due_time && data.due_date) {
        $form.find(".date_options").show();
        $form.find(".show_date_link").hide();
      } else {
        $form.find(".date_options").hide();
        $form.find(".show_date_link").show();
      }
      $form.attr('action', $assignment.find(".title").attr('href'))
        .attr('method', 'PUT');
    }
    if(data.due_time && data.due_date) {
      
    }
    $form.fillFormData(data, { object_name: "assignment" });
    $form.find(":text:first").focus().select();
    $("html,body").scrollTo($assignment);
  }
  function hideGroupForm() {
    var $form = $("#add_group_form");
    var $group = $form.parents(".assignment_group").find(".header");
    $form.find("input[name='name']").val("").change().end()
      .find(".form_rules").empty().end()
      .hide().appendTo($("body"));
    $group.find(".hide_info_link").click();
    $group.find(".header_content, .edit_group_link, .delete_group_link").show();
    if($group.parents(".assignment_group").attr('id') == "group_new") {
      $group.parents(".assignment_group").remove();
    } else {
      $group.find(".group_name").focus();
    }
  }
  function editGroup($group) {
    hideGroupForm();
    var data = $group.getTemplateData({ textValues: ["name", "assignment_group_id", "group_weight", "assignment_weighting_scheme", "rules"] });
    var $form = $("#add_group_form");
    $form.find(".form_rules").empty();
    var rules = (data.rules || "").split("\n");
    var $options = $form.find("#assignment_group_rule_blank .assignment_to_never_drop");
    $options.empty();
    if($group.find(".group_assignment").length > 0) {
      var $option = $(document.createElement("option"));
      $option.val("0").text("[Select Assignment]");
      $options.append($option);
      $group.find(".group_assignment").each(function() {
        $option = $(document.createElement('option'));
        var data = $(this).getTemplateData({textValues: ['id', 'title']});
        $option.val(data.id).text(data.title);
        $options.append($option);
      });
    } else {
      var $option = $(document.createElement("option"));
      $option.val("0").text("[No Assignments]");
      $options.append($option);
    }
    $options.val("0");
    $.each(rules, function(i, rule) {
      var parts = rule.split(":");
      if(parts.length == 2) {
        var $rule = $form.find("#assignment_group_rule_blank").clone(true);
        $rule.attr('id', '');
        $form.find(".form_rules").append($rule.show());
        $rule.find("select[name='rule_type']").val(parts[0]).change();
        if(parts[0] == "never_drop") {
          $rule.find("input[name='scores_to_drop']").val("");
          $rule.find("select[name='assignment_to_never_drop']").val(parts[1]);
        } else {
          $rule.find("input[name='scores_to_drop']").val(parts[1]);
          $rule.find("select[name='assignment_to_never_drop']").val("0");
        }
      }
    });
    var $options = $form.find(".assignment_to_never_drop");
    $group.find(".header_content").hide()
      .before($form.show());
    if($("#class_weighting_policy").attr('checked')) {
      $group.find("#add_group_form .percent_weighting").show().end()
        .find("#add_group_form .weighting").hide();
    } else {
      $group.find(".percent_weighting").hide().end()
        .find(".weighting").hide();
    }
    $form.fillFormData(data, {object_name: 'assignment_group'});
    if($group.attr('id') == 'group_new') {
      $form.attr('action', $("#add_group .assignment_groups_url").attr('href')).attr('method', 'POST');
    } else {
      $form.attr('action', $group.find(".assignment_group_url").attr('href')).attr('method', 'PUT');
    }
    $form.find(":text:first").focus().select();
  }
  function addAssignment($group, slideDown) {
    $(document).triggerHandler('add_assignment');
    if(!$group || $group.length === 0) {
      var group_id = $(".assignment_groups_select").val();
      $group = $("#" + group_id);
      if($group.length === 0) {
        $group = $("#groups .assignment_group:first");
      }
    }
    if($group.length === 0) { return; }
    if($("#assignment_new").length > 0) {
      if($("#assignment_new").parents('.assignment_group')[0] == $group[0]) {
        $("#assignment_new :text:first").focus().select();
        return;
      }
      hideAssignmentForm();
    }
    $(".no_assignments_message").hide();
    var $assignment = $("#assignment_blank").clone(true);
    $assignment.attr('id', 'assignment_new');
    $group.find(".assignment_list").prepend($assignment);
    $group.find(".padding").hide();
    $group.find(".assignment_list").sortable('refresh');
    if(!slideDown || true) {
      $assignment.slideDown('fast', function() {
        $(this).find(":text:first").focus().select();
      });
    } else {
      $assignment.hide().animate({opacity: 1.0}, 500).slideDown('normal', function() {
        $(this).find(":text:first").focus().select();
      });
    }
    editAssignment($assignment);
  }
  function updateAssignment($assignment, data) {
    var assignment = data.assignment;
    var id = $assignment.attr('id');
    if((id == 'assignment_new' || id == 'assignment_creating') && (assignmentCount) && updateAssignmentCounts) {
      assignmentCount++;
      updateAssignmentCounts();
    }
    if(assignment.due_at) {
      var date_data = $.parseFromISO(assignment.due_at, 'due_date');
      assignment.due_date = date_data.date_formatted;
      assignment.due_time = date_data.time_formatted;
      assignment.timestamp = date_data.timestamp;
      assignment.due_date_string = $.datepicker.formatDate("mm/dd/yy", date_data.date);
      assignment.due_time_string = date_data.time_string;
      $assignment.find(".date_text").show();
    } else {
      $assignment.find(".date_text").hide();
      assignment.timestamp = 0;
    }
    $assignment.find(".assignment_title").find(".title").attr('title', assignment.title);
    $assignment.find(".points_text").showIf(assignment.points_possible);
    $assignment.loadingImage('remove');
    if(!assignment.timestamp) {
      assignment.timestamp = 0;
    }
    var isNew = false;
    if($assignment.attr('id') == 'assignment_creating') {
      isNew = true;
    }
    $assignment.fillTemplateData({ 
      id: "assignment_" + assignment.id, 
      data: assignment,
      hrefValues: ['id']
    });
    $assignment.find(".description").val(assignment.description);
    $assignment.find(".links,.move").css('display', '');
    $assignment.toggleClass('group_assignment_editable', assignment.permissions && assignment.permissions.update);
    addAssignmentToGroup($assignment.parents(".assignment_group"), $assignment);
    $("html,body").scrollTo($assignment);
  }
  function addAssignmentToGroup($group, $assignment) {
    var data = $assignment.getTemplateData({textValues: ['timestamp', 'title', 'position']}),
        isPlaced = false;

    data.position = Number(data.position);
    $group.find(".assignment_list .group_assignment").each(function() {
      if ($(this).attr('id') === $assignment.attr('id') || $(this).attr('id') === "assignment_new") { return; }
      var thisData = $(this).getTemplateData({textValues: ['timestamp', 'title', 'position']});
      if ( (data.position < thisData.position) ||
           (data.position == thisData.position && data.timestamp < thisData.timestamp) ||
           (data.position == thisData.position && data.timestamp == thisData.timestamp && data.title < thisData.title) ) {
        isPlaced = true;
        $(this).before($assignment);
        return false;
      }
    });
    if (!isPlaced) {
      $group.find(".assignment_list").append($assignment);
    }
  }
  var sortable_options = {
    handle: '.group_move, .group_move_icon',
    scroll: true,
    axis: 'y',
    start: function(event, ui) {
      var width = ui.item.outerWidth();
      ui.helper.width(width);
    },
    update: function(event) {
      var $drag = $(event.target).parents(".assignment_group").css('width', ''),
          groups = [];
      $("#groups .assignment_group").each(function() {
        var data = $(this).getTemplateData({ textValues: ['assignment_group_id'] });
        if($(this)[0] != $drag[0]) {
          groups.push(data.assignment_group_id);
        }
      });
      var data = {};
      data.order = groups.join(',');
      var url = $(".reorder_groups_url").attr('href');
      $.ajaxJSON(url, 'POST', data, function(data) {
        $(document).triggerHandler('group_reorder', data);
      });
    }
  };
  var assignment_sortable_options = {
    items: '.group_assignment',
    connectWith: '.assignment_group .assignment_list',
    handle: '.move_icon, .move',
    axis: 'y',
    opacity: 0.8,
    scroll: true,
    containment: '#content',
    update: function(event, ui) {
      var $group = $(ui.item).parents(".assignment_group"),
          url    = $group.find(".reorder_assignments_url").attr('href'),
          order  = [];

      $group.find(".assignment_list .group_assignment").each(function(i) {
        $(this).find('.position').text(i + 1); // +1 because i is zero-based
        order.push($(this).getTemplateData({textValues: ['id']}).id);
      });

      var newOrder  = order.join(','),
          newUpdate = [url, newOrder].join('-');

      if (assignment_sortable_options.lastUpdate !== newUpdate) {
        assignment_sortable_options.lastUpdate = newUpdate;
        $.ajaxJSON(url, 'POST', {order: newOrder}); // don't need to do anything with the response
      }
    }
  };
  var draggable_options = {
    handle: '.move_icon, .move',
    axis: 'y',
    helper: function() {
      var $result = $(this).clone();
      $result.css('zIndex', 20);
      $result.css('backgroundImage', '#ccc');
      $result.find(".links").hide();
      $result.addClass('assignment-hover');
      $result.width($(this).outerWidth());
      return $result;
    },
    opacity: 0.8,
    scroll: true
  };
  var droppable_options = {
    accept: '.group_assignment',
    hoverClass: 'droppable_group',
    drop: function(e, ui) {
      var $newGroup = $(this);
      var data = $newGroup.getTemplateData({textValues: ['assignment_group_id']});
      var $assignment = $(ui.draggable);
      var $oldGroup = $assignment.parents(".assignment_group");
      data['assignment[assignment_group_id]'] = data.assignment_group_id;
      var url = $assignment.find(".title").attr('href');
      $assignment.addClass('event_pending');
      addAssignmentToGroup($newGroup, $assignment);
      $newGroup.find(".padding").hide();
      if($oldGroup.find(".group_assignment").length <= 1) {
        $oldGroup.find(".padding").show();
      }
      $.ajaxJSON(url, 'PUT', data, function(data) {
        var assignment = data.assignment;
        $assignment.removeClass('event_pending');
        var $oldGroup = $newGroup;
        $newGroup = $("#group_" + assignment.assignment_group_id);
        addAssignmentToGroup($newGroup, $assignment);
        $newGroup.find(".padding").hide();
        if($oldGroup.find(".group_assignment").length <= 1) {
          $oldGroup.find(".padding").show();
        }
      });
    }
  };
  function updateGroupsSelect() {
    var $select = $(".assignment_groups_select");
    var val = $select.val();
    $select.empty();
    $(".assignment_group:visible").each(function() {
      var id = $(this).attr('id');
      var title = $(this).getTemplateData({textValues: ['name']}).name;
      var $option = $(document.createElement('option')).val(id).text(title);
      $select.append($option);
    });
    $select.val(val);
  }
  $(document).ready(function() {
    $("#add_assignment_form .more_options_link").click(function(event) {
      event.preventDefault();
      var pieces = $(this).attr('href').split("#");
      var data = $(this).parents("form").getFormData({object_name: 'assignment'});
      var params = {};
      if(data.title) { params['title'] = data.title; }
      if(data.due_at) { params['due_at'] = data.due_at; }
      if (data.points_possible) { params['points_possible'] = data.points_possible; }
      if(data.assignment_group_id) { params['assignment_group_id'] = data.assignment_group_id; }
      if(data.submission_types) { params['submission_types'] = data.submission_types; }
      params['model_key'] = Math.round(Math.random() * 999999);
      if(INST && INST.gettingStartedPage) {
        params['getting_started'] = '1';
      }
      params['return_to'] = location.href;
      pieces[0] += "?" + $.param(params);
      location.href = pieces.join("#");
    });
    $(".datetime_field").datetime_field();
    $(document).bind('group_reorder', function(event, data) {
      if(data && data.order) {
        for(var idx in data.order) {
          var id = data.order[idx];
          $("#groups").append($("#group_" + id));
          $("#group_weight tbody:first").append($("#group_weight_" + id));
        }
      }
    });
    $(document).bind('group_create', function(event, data) {
      if(data && data.assignment_group) {
        var group = data.assignment_group;
        var index = $("#groups .assignment_group").index($("#group_" + group.id));
        var $before = $("#group_weight .group_weight").eq(index);
        var $group = $("#group_weight_blank").clone(true).removeAttr('id');
        $group.fillTemplateData({
          data: group,
          id: 'group_weight_' + group.id
        });
        $group.find(".weight").val(group.group_weight).triggerHandler('change');
        $("#group_weight tbody:first").prepend($group.show());
        $("#group_weight tbody").sortable('refresh');
      }
    });
    $("#class_weighting_policy").bind('checked', function(event) {
      var doWeighting = $(this).attr('checked');
      $("#groups .assignment_group").find(".more_info_brief,.group_weight_percent").showIf(doWeighting);
    });
    $("#group_weight .group_weight").hover(function() {
      $("#group_weight .group_weight_hover").removeClass('group_weight_hover');
      $(this).addClass('group_weight_hover');
    }, function() {
    });
    $(document).bind('mouseover', function(event) {
      if($(event.target).closest("#group_weight").length === 0) {
        $("#group_weight .group_weight_hover").removeClass('group_weight_hover');
      }
      if($(event.target).closest(".assignment_group").length === 0) {
        $(".group_assignment.assignment-hover").removeClass('assignment-hover');
      }
    });
    $("#group_weight").bind('weight_change', function() {
      var tally = 0;
      $("#group_weight .weight:visible").each(function() {
        var val = parseFloat($(this).val(), 10);
        if(isNaN(val)) { val = 0; }
        tally += val;
      });
      $("#group_weight #group_weight_total").text(tally + "%");
    });
    $("#group_weight .weight").bind('change', function(event, submit) {
      var val = parseFloat($(this).val(), 10);
      if(isNaN(val)) { val = 0; }
      $(this).val(val);
      $("#group_weight").triggerHandler('weight_change');
      if(submit !== false) {
        var $weight = $(this);
        $weight.parents(".group_weight").loadingImage({image_size: 'small'});
        var group_id = $weight.parents(".group_weight").getTemplateData({textValues: ['id']}).id;
        var url = $("#group_" + group_id).find(".assignment_group_url").attr('href');
        var data = {'assignment_group[group_weight]': $weight.val() };
        $.ajaxJSON(url, 'PUT', data, function(data) {
          $weight.parents(".group_weight").loadingImage('remove');
          var weight = (data.assignment_group.group_weight || 0);
          $weight.val(weight);
          $weight.triggerHandler('change', false);
          $("#group_" + group_id).find(".group_weight").text(weight);
        }, function(data) {
          $weight.parents(".group_weight").loadingImage('remove');
        });
      }
    }).each(function() { $(this).triggerHandler('change', false); });
    $("#group_weight tbody").sortable({
      handle: '.move',
      scroll: true,
      axis: 'y',
      update: function(event) {
        var groups = [];
        $("#group_weight .group_weight").each(function() {
          var data = $(this).getTemplateData({textValues: ['id']});
          groups.push(data.id);
        });
        var data = {};
        data.order = groups.join(",");
        var url = $(".reorder_groups_url").attr('href');
        $("#group_weight").loadingImage();
        $.ajaxJSON(url, 'POST', data, function(data) {
          $("#group_weight").loadingImage('remove');
          $(document).triggerHandler('group_reorder', data);
        }, function() {
          $("#group_weight").loadingImage('remove');
        });
      }
    });
    $("#class_weighting_policy").change(function(event, justInit) {
      if(justInit) { 
        $(this).triggerHandler('checked');
        return; 
      }
      var data = {};
      var doWeighting = $(this).attr('checked');
      data['course[group_weighting_scheme]'] = doWeighting ? "percent" : "equal";
      $("#class_weighting_box").loadingImage({image_size: 'small'});
      $.ajaxJSON($("#class_weighting_box .context_url").attr('href'), 'PUT', data, function(data) {
        var course = data.course;
        $("#group_weight").showIf(doWeighting);
        var anyHaveWeight = false;
        $("#group_weight .group_weight:visible").each(function() {
          var val = parseInt($(this).find(".weight").val(), 10);
          if(val) {
            anyHaveWeight = true;
          }
        });
        if(!anyHaveWeight) {
          var cnt = $("#group_weight .group_weight:visible").length;
          var weightPerGroup = 100 / cnt;
          $("#group_weight .group_weight:visible").each(function() {
            $(this).find(".weight")
              .val(weightPerGroup)
              .triggerHandler('change');
          });
          $("#group_weight .group_weight:visible:last").find(".weight")
            .val(100 - (weightPerGroup * (cnt - 1)))
            .triggerHandler('change');
        }
        $("#class_weighting_box").loadingImage('remove');
        doWeighting = course.group_weighting_scheme == "percent";
        $("#class_weighting_policy").attr('checked', doWeighting);
        $("#class_weighting_policy").triggerHandler('checked');
      });
    }).triggerHandler('change', true);
    $(".more_info_link").click(function(event) {
      event.preventDefault();
      $(this).hide();
      $(this).parents(".assignment_group").find(".hide_info_link").show().end()
        .find(".more_info").show();
      var rules = "";
      var ruleData = $(this).parents(".assignment_group").find(".rules").text().split("\n");
      $.each(ruleData, function(idx, rule) {
        var parts = rule.split(":");
        if(parts.length == 2) {
          var rule_type = parts[0];
          var value = parts[1];
          if(rule_type == "drop_lowest") {
            rules += "Drop the Lowest " + value + " Scores<br/>";
          } else if(rule_type == "drop_highest") {
            rules += "Drop the Highest " + value + " Scores<br/>";					
          } else if(rule_type == "never_drop") {
            var title = $("#assignment_" + value).find(".title").text();
            rules += "Never Drop " + title + "<br/>";
          }
        }
      });
      $(this).parents(".assignment_group").find(".rule_details").html(rules);
    });
    $(".hide_info_link").click(function(event) {
      event.preventDefault();
      $(this).parents(".assignment_group").find(".more_info_link").show().end()
        .find(".hide_info_link").hide().end()
        .find(".more_info").hide();
    });
    $(".group_assignment").hover(function(event) {
      $(".assignment_group.group-hover").removeClass('group-hover');
      $(this).parents(".assignment_group").addClass('group-hover');
      if($("#groups .assignment_group").length > 1 && $(this).parents(".assignment_group").find(".edit_group_link:visible").length > 0) {
        $(this).parents(".assignment_group").find(".group_move_icon").show();
      } else {
        $(this).parents(".assignment_group").find(".group_move_icon").hide();
      }
      $(".group_assignment.assignment-hover").removeClass('assignment-hover');
      $(this).addClass('assignment-hover');
      if($("#groups .assignment_group").length > 0 && $(this).find(".edit_assignment_link").css('display') != 'none') {      
        $(this).find(".submitted_icon").hide();
        $(this).find(".move_icon").show();
      } else {
        $(this).find(".move_icon").hide();
      }
    }, function(event) {
    });
    $(".add_group_link").click(function(event) {
      event.preventDefault();
      if($("#group_new").length > 0 && $("#add_group_form").css('display') == "block") {
        return;
      }
      $("#group_blank .header .name").text("Other Assignments");
      var $group = $("#group_blank").clone(true);
      $group.find(".assignment_list").empty();
      $group.attr('id', "group_new").find(".header .name").text("Group Name");
      $("#groups").prepend($group.show());
      $group.find(".padding").show();
      var doWeighting = $("#class_weighting_policy").attr('checked');
      $group.find(".assignment_list").sortable(assignment_sortable_options);
      $(".assignment_group .assignment_list").sortable('option', 'connectWith', '.assignment_group .assignment_list');
      editGroup($group);
    });
    $(".edit_group_link").click(function(event) {
      event.preventDefault();
      var $group = $(this).parents(".assignment_group");
      editGroup($group);
    });
    $(".delete_group_link").click(function(event) {
      event.preventDefault();
      var $group = $(this).parents(".assignment_group");
      var id = $group.getTemplateData({textValues: ['assignment_group_id']}).assignment_group_id;
      $group.confirmDelete({
        message: "Are you sure you want to delete this group?",
        url: $(this).attr('href'),
        success: function() {
          hideGroupForm();
          $group.slideUp('normal', function() {
            $(this).remove();
            updateGroupsSelect();
            $("#group_weight_" + id).remove();
            $("#group_weight .group_weight:visible:first .weight").triggerHandler('change', false);
          });
          if($("#groups .assignment_group").length <= 1) {
            $("#groups .assignment_group .delete_group_link").hide();
          }
          if(assignmentGroupCount && updateAssignmentCounts) {
            assignmentGroupCount--;
            updateAssignmentCounts();
          }
        }
      });
    });
    $("#add_group_form .cancel_button").click(function() {
      var $group = $(this).parents(".assignment_group");
      hideGroupForm();
    });
    $("#add_group_form").formSubmit({
      object_name: 'assignment_group',
      processData: function(data) {
        data = $(this).getFormData({ object_name: 'assignment_group' });
        var $group = $(this).parents(".assignment_group").find(".header");
        var $rules = $group.find(".form_rules .rule");
        var ruleList = "";
        $.each($rules, function(i, rule) {
          var $rule = $(rule);
          var rule_type = $rule.find("select[name='rule_type']").val();
          var scores_to_drop = $rule.find("input[name='scores_to_drop']").val();
          var assignment_to_never_drop = $rule.find("select[name='assignment_to_never_drop']").val();
          if(rule_type == "never_drop") {
            if(assignment_to_never_drop != "0") {
              var ruleText = rule_type + ":" + assignment_to_never_drop + "\n";
              ruleList += ruleText;
            }
          } else {
            var n = parseInt(scores_to_drop, 10);
            if(!isNaN(n) && isFinite(n) && n > 0) {
              var ruleText = rule_type + ":" + scores_to_drop + "\n";
              ruleList += ruleText;
            }
          }
        });
        data.rules = ruleList;
        data['assignment_group[rules]'] = data.rules;
        return data;
      }, 
      beforeSubmit: function(data) {
        var $group = $(this).parents(".assignment_group");
        var $group_header = $group.find(".header");
        $group_header.fillTemplateData({ data: data, htmlValues: ["rules"] }); //textValues: data, htmlValues: { rules: ruleList} });
        $group_header.loadingImage({image_size: 'small'});
        if($group.attr('id') == 'group_new') {
          $group.attr('id', 'group_creating');
        }
        hideGroupForm();
        return $group;
      }, 
      success: function(data, $group) {
        var $group_header = $group.find(".header");
        $group_header.loadingImage('remove');
        var group = data.assignment_group;
        if($group.attr('id') == 'group_creating') {
          $(document).triggerHandler('group_create', data);
        }
        if($group.attr('id') == 'group_creating' && assignmentGroupCount && updateAssignmentCounts) {
          assignmentGroupCount++;
          updateAssignmentCounts();
        }
        group.assignment_group_id = group.id;
        $group.attr('id', 'group_' + group.id);
        $group_header.fillTemplateData({
          data: group,
          hrefValues: ['id']
        });
        $("#group_weight_" + group.id).find(".weight").val(group.group_weight || 0).triggerHandler('change', false);
        $group.toggleClass('assignment_group_editable', group.permissions && group.permissions.update);
        $("#class_weighting_policy").trigger('change', true);
        if($("#groups .assignment_group").length > 1 && !group.permissions || !group.permissions['delete']) {
          $("#groups .assignment_group .delete_group_link").show();
        }
        $group.triggerHandler('group_update');
        updateGroupsSelect();
      }
    });
    $(".assignment_group").bind('group_update', function() {
      var $group = $(this);
      var rules = $group.getTemplateData({textValues: ['rules']}).rules;
      $group.find(".more_info_link").showIf(rules);
    }).each(function() { $(this).triggerHandler('group_update'); });
    $(".group_rule_type").change(function(event) {
      var $rule = $(this).parents(".rule");
      var val = $(this).val();
      if(val == "never_drop") {
        $rule.find(".drop_scores").hide().end()
          .find(".never_drop_assignment").show();
      } else {
        $rule.find(".drop_scores").show().end()
          .find(".never_drop_assignment").hide();
      }
    }).val("drop_lowest").change();
    var groupRuleIndex = 0;
    $(".add_rule_link").click(function(event) {
      event.preventDefault();
      var $rule = $("#assignment_group_rule_blank").clone(true);
      $rule.attr('id', '');
      $("#add_group_form .form_rules").append($rule.show());
    });
    $(".delete_rule_link").click(function(event) {
      event.preventDefault();
      $(this).parents(".rule").remove();
    });
    $(".add_assignment_link").click(function(event) {
      event.preventDefault();
      addAssignment($(this).parents(".assignment_group"));
    });
    $("#add_assignment_form input[name='assignment[due_date]']").datepicker({
      gotoCurrent: true,
      onClose: function() {
        $("#add_assignment_form input[name='assignment[due_date]']").focus().select();
      }
    });
    $("#add_assignment_form :input").formSuggestion();
    $("#add_assignment_form").formSubmit({
      object_name: 'assignment',
      required: ['title'],
      processData: function(data) {
        var formData = $(this).getFormData({object_name: "assignment"});
        if(formData['assignment[due_at]']) {
          formData['assignment[due_at]'] = $.datetime.process(formData['assignment[due_at]']);
        }
        return formData;
      },
      beforeSubmit: function(data) {
        var $assignment = $(this).parents(".group_assignment");
        $assignment.fillTemplateData({ data: data });	
        var date = null;
        if(data['assignment[due_at]']) {
          date = Date.parse(data['assignment[due_at]']);
        }
        var updatedTimestamp = 0;
        if(date) {
          updatedTimestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()) / 1000;
          due_time = date.toString('h:mmtt').toLowerCase();
          if(due_time == '12:00am') {
            due_time = '';
          }
          $assignment.fillTemplateData({data: {
            due_date: $.dateString(date),
            due_time: due_time
          }});
        }
        $assignment.find(".date_text").show();
        if(isNaN(updatedTimestamp) || !isFinite(updatedTimestamp) || !updatedTimestamp) {
          updatedTimestamp = 0;
          $assignment.find(".date_text").hide();
        }
        $assignment.fillTemplateData({data: {
          timestamp: updatedTimestamp, 
          title: data.title
        } });
        $assignment.find(".points_text").showIf(data.points_possible);
        addAssignmentToGroup($assignment.parents(".assignment_group"), $assignment);
        $assignment.find(".links").hide();
        $assignment.loadingImage({image_size: 'small', paddingTop: 5});
        $("html,body").scrollTo($assignment);
        
        var isNew = false;
        if($assignment.attr('id') == "assignment_new") {
          isNew = true;
          $assignment.attr('id', "assignment_creating");
        }
        hideAssignmentForm();
        return $assignment;
      },
      success: function(data, $assignment) {
        $(document).triggerHandler('assignment_update');
        updateAssignment($assignment, data);
      },
      error: function(data, $assignment) {
      }
    });
    $("#add_assignment_form .cancel_button").click(function() {
      var $assignment = $(this).parents(".group_assignment");
      var $group = $assignment.parents(".assignment_group");
      hideAssignmentForm();
    });
    $(".delete_assignment_link").click(function(event) {
      event.preventDefault();
      var $assignment = $(this).parents(".group_assignment");
      var $group = $assignment.parents(".assignment_group");
      $assignment.confirmDelete({
        message: "Are you sure you want to delete this assignment?",
        url: $(this).attr('href'),
        success: function() {
          $assignment.slideUp(function() {
            $assignment.remove();
            if($group.find(".group_assignment").length === 0) {
              $group.find(".padding").show();
            }
          });
          if(assignmentCount && updateAssignmentCounts) {
            assignmentCount--;
            updateAssignmentCounts();
          }
        }
      });
    });
    $(".edit_assignment_link").click(function(event) {
      event.preventDefault();
      var $assignment = $(this).parents(".group_assignment");
      editAssignment($assignment);
    });
    $(".show_date_link,.hide_date_link").click(function(event) {
      event.preventDefault();
      $(this).parents("form").find(".date_options").toggle();
      $(".show_date_link").toggle();
      defaultShowDateOptions = !defaultShowDateOptions;
    });
    $("#groups").sortable(sortable_options);
    $("#groups.groups_editable .assignment_group .assignment_list").sortable(assignment_sortable_options);
    if($("#groups .assignment_group").length === 0 && $("#group_blank .group_assignment").length === 0) {
      addAssignment();
    }
    $("#add_assignment_form :text").keydown(function(event) {
      if(event.keyCode == 27) {
        hideAssignmentForm();
      }
    });
    $("#add_group_form :text").keydown(function(event) {
      if(event.keyCode == 27) {
        hideGroupForm();
      }
    });
    $("#edit_assignment_form").bind('assignment_updated', function(event, data) {
      var $assignment = $("#assignment_" + data.assignment.id); //$("#edit_assignment_form").data('current_assignment');
      updateAssignment($assignment, data);    
    });
    $(".preview_assignment_link").click(function(event) {
      event.preventDefault();
      var $assignment = $(this).parents(".group_assignment");
      var data = $assignment.getTemplateData({
        textValues: ['title', 'id', 'points_possible', 'due_date', 'due_time', 'due_date_string', 'due_time_string', 'submission_types', 'assignment_group_id', 'grading_type', 'min_score', 'max_score', 'mastery_score', 'unlock_at']
      });
      data.description = $assignment.find(".description").val() || "No Content";
      data.due_at = $.trim(data.due_date + " " + data.due_time);
      $("#full_assignment").fillTemplateData({
        data: data,
        htmlValues: ['description']
      }).find(".date_text").showIf(data.due_date && data.due_date.length > 0).end()
        .find(".points_text").showIf(data.points_possible && data.points_possible.length > 0);
      $("#edit_assignment_form").fillFormData({
        data: data,
        object_name: "assignment"
      }).attr('action', $assignment.find(".assignment_url").attr('href'));
      var height = Math.max(Math.round($(window).height() * 0.8), 400);
      $("#full_assignment_holder").dialog('close').dialog({
        title: "Assignment Details",
        autoOpen: false,
        width: 630,
        height: height,
        modal: true,
        close: function() {
          $("#full_assignment_holder #edit_assignment_form .cancel_button").click();
        },
        overlay: {
          backgroundColor: "#000",
          opacity: 0.7
        }
      }).dialog('open');
      $("#full_assignment").show();
    });
    $(document).keycodes('j k', function(event) {
      event.preventDefault();
      if(event.keyString == 'j') { 
        moveSelection('down');
      } else if(event.keyString == 'k') {
        moveSelection('up');
      }
    });
    $(".assignment_group").keycodes('a e d m', function(event) {
      event.preventDefault();
      if(event.keyString == 'a') {
        $(this).find(".add_assignment_link:visible:first").click();
      } else if(event.keyString == 'e') {
        $(this).find(".edit_group_link:visible:first").click();
      } else if(event.keyString == 'd') {
        $(this).find(".delete_group_link:visible:first").click();
      }
    });
    $(".group_assignment").keycodes('f e d m', function(event) {
      event.preventDefault();
      event.stopPropagation();
      if(event.keyString == 'f') {
        $(this).find(".preview_assignment_link:visible:first").click();
      } else if(event.keyString == 'e') {
        $(this).find(".edit_assignment_link:visible:first").click();
      } else if(event.keyString == 'd') {
        $(this).find(".delete_assignment_link:visible:first").click();
      } else if(event.keyString == 'm') {
      }
    });
    $(document).click(function(event) {
      if($(event.target).closest(".assignment_group").length === 0) {
        $(".group_assignment.assignment-hover").removeClass('assignment-hover');
        $(".assignment_group.group-hover").removeClass('group-hover');
      }
    });
    $(".group_assignment .title").focus(function(event) {
      $(this).parents(".group_assignment").triggerHandler('mouseover');
    });
    $("#wizard_box").bind('wizard_opened', function() {
      $(this).find(".wizard_introduction").click();
    });
  });
  function moveSelection(direction) {
    var $currentAssignment = $(".group_assignment.assignment-hover:first");
    var $currentGroup = $(".assignment_group.group-hover:first");
    if($currentGroup.length === 0) {
      $currentGroup = $(".assignment_group:visible:first");
      $currentGroup.addClass('group-hover');
      $currentGroup.find(".group_name").focus();
      return;
    }
    var $newAssignment = $currentAssignment;
    var $newGroup = null;
    if($currentAssignment.length === 0) {
      if(direction == 'up') {
        $newGroup = $currentGroup.prev(".assignment_group:visible");
        $newAssignment = $newGroup.find(".group_assignment:visible:last");
      } else {
        $newAssignment = $currentGroup.find(".group_assignment:visible:first");
      }
    } else {
      if(direction == 'up') {
        $newAssignment = $currentAssignment.prev(".group_assignment:visible");
        if($newAssignment.length === 0) {
          $newAssignment = null;
          $currentGroup.find(".group_name").focus();
        }
      } else {
        $newAssignment = $currentAssignment.next(".group_assignment:visible");
        if($newAssignment.length === 0) {
          $newGroup = $currentGroup.next(".assignment_group:visible");
          if($newGroup.length === 0) {
            $newGroup = null;
            $newAssignment = $currentAssignment;
          }
        }
      }
    }
    $currentAssignment.removeClass('assignment-hover');
    if($newGroup) {
      if($newGroup.length === 0) { $newGroup = $currentGroup; }
      $currentGroup.removeClass('group-hover');
      $newGroup.addClass('group-hover');
      $newGroup.find(".group_name").focus();
      if($newAssignment.length > 0 && $newAssignment.parents(".assignment_group")[0] == $newGroup[0]) {
        $newAssignment.addClass('assignment-hover');
        $newAssignment.find(":tabbabble:first").focus();
      }
    } else if($newAssignment) {
      $newAssignment.addClass('assignment-hover');
      $newAssignment.find(":tabbable:first").focus();
    }
  }
})();